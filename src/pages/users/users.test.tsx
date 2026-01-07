import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/utils";
import { mockUsersResponse } from "../../test/mocks/users";
import { Users } from "./index";

// Mock ContentLayout to avoid circular import issues with AppPath
vi.mock("components/layout/content/contentLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the users service
vi.mock("services/users", () => ({
  default: {
    getAll: vi.fn(() => Promise.resolve(mockUsersResponse)),
  },
}));

// Configure userEvent to skip pointer-events check (Ant Design uses pointer-events: none on some elements)
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe("Users Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Table Loading", () => {
    it("displays 13 rows on first page", async () => {
      renderWithProviders(<Users />);

      await waitFor(() => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1]; // tbody is second rowgroup
        const rows = within(tbody).getAllByRole("row");
        expect(rows).toHaveLength(13);
      });
    });

    it("shows pagination with multiple pages", async () => {
      renderWithProviders(<Users />);

      await waitFor(() => {
        // With 30 users and 13 per page, we should have 3 pages
        const pagination = screen.getByRole("list"); // ant pagination uses ul
        const pageButtons = within(pagination).getAllByRole("listitem");
        // Should have: prev, 1, 2, 3, next (at minimum)
        expect(pageButtons.length).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe("Pagination", () => {
    it("page 2 displays 13 different rows", async () => {
      renderWithProviders(<Users />);

      // Wait for table to load and get first page IDs
      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      const getVisibleIds = () => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1];
        const rows = within(tbody).getAllByRole("row");
        return rows.map((row) => within(row).getAllByRole("cell")[0].textContent);
      };

      await waitFor(() => {
        expect(getVisibleIds()).toHaveLength(13);
      });

      const page1Ids = getVisibleIds();

      // Click page 2
      const page2Button = screen.getByRole("listitem", { name: "2" });
      await user.click(page2Button);

      await waitFor(() => {
        const page2Ids = getVisibleIds();
        expect(page2Ids).toHaveLength(13);
        // Ensure page 2 has different IDs than page 1
        expect(page2Ids).not.toEqual(page1Ids);
        // No overlap between pages
        page2Ids.forEach((id) => {
          expect(page1Ids).not.toContain(id);
        });
      });
    });
  });

  describe("Email Sorting", () => {
    it("clicking Email header sorts ascending then descending", async () => {
      renderWithProviders(<Users />);

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      const getEmails = () => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1];
        const rows = within(tbody).getAllByRole("row");
        return rows.map((row) => within(row).getAllByRole("cell")[4].textContent); // Email is 5th column (index 4)
      };

      await waitFor(() => {
        expect(getEmails().length).toBe(13);
      });

      const originalEmails = getEmails();

      // Click Email header to sort ascending
      const emailHeader = screen.getByRole("columnheader", { name: /email/i });
      await user.click(emailHeader);

      await waitFor(() => {
        const sortedEmails = getEmails();
        const expectedAsc = [...sortedEmails].sort((a, b) =>
          (a || "").localeCompare(b || "")
        );
        expect(sortedEmails).toEqual(expectedAsc);
      });

      // Click again to sort descending
      await user.click(emailHeader);

      await waitFor(() => {
        const sortedEmails = getEmails();
        const expectedDesc = [...sortedEmails].sort((a, b) =>
          (b || "").localeCompare(a || "")
        );
        expect(sortedEmails).toEqual(expectedDesc);
      });
    });
  });

  describe("FirstName Filter", () => {
    it("filtering by 'Miles' shows 1 row with ID=4", async () => {
      renderWithProviders(<Users />);

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // Click the filter icon for First name column
      const firstNameHeader = screen.getByRole("columnheader", { name: /first name/i });
      const filterIcon = within(firstNameHeader).getByRole("button");
      await user.click(filterIcon);

      // Wait for filter dropdown and type "Miles"
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search firstName")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search firstName");
      await user.type(searchInput, "Miles");

      // Click Search button (use getByText for exact match to avoid icon buttons)
      const searchButton = screen.getByText("Search", { selector: "button" });
      await user.click(searchButton);

      // Verify only 1 row with ID=4
      await waitFor(() => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1];
        const rows = within(tbody).getAllByRole("row");
        expect(rows).toHaveLength(1);

        const cells = within(rows[0]).getAllByRole("cell");
        expect(cells[0]).toHaveTextContent("4"); // ID column
      });
    });

    it("clearing filter restores original data", async () => {
      renderWithProviders(<Users />);

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // Apply filter first
      const firstNameHeader = screen.getByRole("columnheader", { name: /first name/i });
      const filterIcon = within(firstNameHeader).getByRole("button");
      await user.click(filterIcon);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search firstName")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search firstName");
      await user.type(searchInput, "Miles");

      const searchButton = screen.getByText("Search", { selector: "button" });
      await user.click(searchButton);

      await waitFor(() => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1];
        const rows = within(tbody).getAllByRole("row");
        expect(rows).toHaveLength(1);
      });

      // Now clear the filter
      await user.click(filterIcon);

      await waitFor(() => {
        expect(screen.getByText("Reset", { selector: "button" })).toBeInTheDocument();
      });

      const resetButton = screen.getByText("Reset", { selector: "button" });
      await user.click(resetButton);

      // Verify table is back to 13 rows
      await waitFor(() => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1];
        const rows = within(tbody).getAllByRole("row");
        expect(rows).toHaveLength(13);
      });
    });
  });

  describe("LastName Filter", () => {
    it("filtering by 'Cummerata' shows 1 row with ID=4", async () => {
      renderWithProviders(<Users />);

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // Click the filter icon for Last name column
      const lastNameHeader = screen.getByRole("columnheader", { name: /last name/i });
      const filterIcon = within(lastNameHeader).getByRole("button");
      await user.click(filterIcon);

      // Wait for filter dropdown and type "Cummerata"
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search lastName")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search lastName");
      await user.type(searchInput, "Cummerata");

      // Click Search button (use getByText for exact match to avoid icon buttons)
      const searchButton = screen.getByText("Search", { selector: "button" });
      await user.click(searchButton);

      // Verify only 1 row with ID=4
      await waitFor(() => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1];
        const rows = within(tbody).getAllByRole("row");
        expect(rows).toHaveLength(1);

        const cells = within(rows[0]).getAllByRole("cell");
        expect(cells[0]).toHaveTextContent("4"); // ID column
      });
    });

    it("clearing filter restores original data", async () => {
      renderWithProviders(<Users />);

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // Apply filter first
      const lastNameHeader = screen.getByRole("columnheader", { name: /last name/i });
      const filterIcon = within(lastNameHeader).getByRole("button");
      await user.click(filterIcon);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search lastName")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search lastName");
      await user.type(searchInput, "Cummerata");

      const searchButton = screen.getByText("Search", { selector: "button" });
      await user.click(searchButton);

      await waitFor(() => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1];
        const rows = within(tbody).getAllByRole("row");
        expect(rows).toHaveLength(1);
      });

      // Now clear the filter
      await user.click(filterIcon);

      await waitFor(() => {
        expect(screen.getByText("Reset", { selector: "button" })).toBeInTheDocument();
      });

      const resetButton = screen.getByText("Reset", { selector: "button" });
      await user.click(resetButton);

      // Verify table is back to 13 rows
      await waitFor(() => {
        const table = screen.getByRole("table");
        const tbody = within(table).getAllByRole("rowgroup")[1];
        const rows = within(tbody).getAllByRole("row");
        expect(rows).toHaveLength(13);
      });
    });
  });
});
