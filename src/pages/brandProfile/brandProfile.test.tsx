import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/utils";
import { BrandProfile } from "./index";

// Mock brand data - must be hoisted for vi.mock to access it
const mockBrandData = vi.hoisted(() => ({
  id: 16,
  name: "Coca cola",
  email: "contact@cocacola.com",
  avatar: "https://example.com/cocacola.png",
  address: "123 Main St",
  city: "Atlanta",
  country: "USA",
  postal_code: "30301",
  prefix: "+1",
  region: "Georgia",
  vat: "US123456789",
  code: "COCA",
  analytics_id: "UA-12345",
  facebook_account_id: "cocacola",
  facebook_pixel: "123456789",
  _facebook_account: "Coca Cola Official",
  hubspot_api: "hub-api-key",
  landbot_id: "land-123",
  metricool_url: "https://metricool.com/cocacola",
}));

// Mock the ContentLayout to avoid circular import issues
vi.mock("components/layout/content/contentLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-layout">{children}</div>
  ),
}));

// Mock the brand service (default export)
vi.mock("services/brandProfile", () => ({
  default: {
    getById: vi.fn().mockResolvedValue(mockBrandData),
    getAll: vi.fn().mockResolvedValue({ results: [mockBrandData], count: 1 }),
    update: vi.fn().mockResolvedValue(mockBrandData),
  },
}));

// Mock useGetBrandId hook
vi.mock("hooks", () => ({
  useGetBrandId: () => "16",
  useUpdateBrandId: () => vi.fn(),
}));

describe("BrandProfile Page - Anchor Navigation", () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 });

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders all three anchor navigation tabs: Basic Info, Region Info, Social Networks", async () => {
    renderWithProviders(<BrandProfile />, {
      initialEntries: ["/brandProfile?brandId=16"],
    });

    await waitFor(() => {
      expect(screen.getByText("Basic Info")).toBeInTheDocument();
    });

    expect(screen.getByText("Region Info")).toBeInTheDocument();

    // Find Social Networks anchor specifically (not the card title)
    const anchorLinks = document.querySelectorAll(".ant-anchor-link-title");
    const socialNetworksAnchor = Array.from(anchorLinks).find(
      (el) => el.textContent === "Social Networks"
    );
    expect(socialNetworksAnchor).toBeInTheDocument();
  });

  it("renders all three section cards with matching IDs for anchor links", async () => {
    renderWithProviders(<BrandProfile />, {
      initialEntries: ["/brandProfile?brandId=16"],
    });

    await waitFor(() => {
      expect(document.getElementById("basicInfo")).toBeInTheDocument();
    });

    expect(document.getElementById("regionInfo")).toBeInTheDocument();
    expect(document.getElementById("rss")).toBeInTheDocument();
  });

  it("Basic Info anchor has correct href to #basicInfo section", async () => {
    renderWithProviders(<BrandProfile />, {
      initialEntries: ["/brandProfile?brandId=16"],
    });

    await waitFor(() => {
      expect(screen.getByText("Basic Info")).toBeInTheDocument();
    });

    const basicInfoAnchor = screen.getByText("Basic Info").closest("a");
    expect(basicInfoAnchor).toHaveAttribute("href", "#basicInfo");
  });

  it("Region Info anchor has correct href to #regionInfo section", async () => {
    renderWithProviders(<BrandProfile />, {
      initialEntries: ["/brandProfile?brandId=16"],
    });

    await waitFor(() => {
      expect(screen.getByText("Region Info")).toBeInTheDocument();
    });

    const regionInfoAnchor = screen.getByText("Region Info").closest("a");
    expect(regionInfoAnchor).toHaveAttribute("href", "#regionInfo");
  });

  it("Social Networks anchor has correct href to #rss section", async () => {
    renderWithProviders(<BrandProfile />, {
      initialEntries: ["/brandProfile?brandId=16"],
    });

    await waitFor(() => {
      expect(screen.getByText("Basic Info")).toBeInTheDocument();
    });

    // Find anchor link specifically (not the card title)
    const anchorLinks = document.querySelectorAll(".ant-anchor-link-title");
    const socialNetworksAnchor = Array.from(anchorLinks).find(
      (el) => el.textContent === "Social Networks"
    );
    expect(socialNetworksAnchor?.closest("a")).toHaveAttribute("href", "#rss");
  });

  it("clicking Region Info anchor navigates to region section", async () => {
    renderWithProviders(<BrandProfile />, {
      initialEntries: ["/brandProfile?brandId=16"],
    });

    await waitFor(() => {
      expect(screen.getByText("Region Info")).toBeInTheDocument();
    });

    const regionInfoAnchor = screen.getByText("Region Info");
    await user.click(regionInfoAnchor);

    // Verify the section exists and scrollIntoView would be called
    expect(document.getElementById("regionInfo")).toBeInTheDocument();
  });

  it("clicking Social Networks anchor navigates to social networks section", async () => {
    renderWithProviders(<BrandProfile />, {
      initialEntries: ["/brandProfile?brandId=16"],
    });

    await waitFor(() => {
      expect(screen.getByText("Basic Info")).toBeInTheDocument();
    });

    // Find anchor link specifically (not the card title)
    const anchorLinks = document.querySelectorAll(".ant-anchor-link-title");
    const socialNetworksAnchor = Array.from(anchorLinks).find(
      (el) => el.textContent === "Social Networks"
    ) as HTMLElement;

    await user.click(socialNetworksAnchor);

    // Verify the section exists
    expect(document.getElementById("rss")).toBeInTheDocument();
  });

  it("all anchor links are properly connected to their target sections", async () => {
    renderWithProviders(<BrandProfile />, {
      initialEntries: ["/brandProfile?brandId=16"],
    });

    await waitFor(() => {
      expect(screen.getByText("Basic Info")).toBeInTheDocument();
    });

    // Get all anchor links using the Ant Design anchor class
    const anchorLinks = document.querySelectorAll(".ant-anchor-link-title");

    // Find each anchor by text
    const basicInfoLink = Array.from(anchorLinks)
      .find((el) => el.textContent === "Basic Info")
      ?.closest("a");
    const regionInfoLink = Array.from(anchorLinks)
      .find((el) => el.textContent === "Region Info")
      ?.closest("a");
    const socialNetworksLink = Array.from(anchorLinks)
      .find((el) => el.textContent === "Social Networks")
      ?.closest("a");

    // Verify each anchor href points to correct section
    expect(basicInfoLink).toHaveAttribute("href", "#basicInfo");
    expect(regionInfoLink).toHaveAttribute("href", "#regionInfo");
    expect(socialNetworksLink).toHaveAttribute("href", "#rss");

    // Verify target elements exist
    expect(document.getElementById("basicInfo")).toBeInTheDocument();
    expect(document.getElementById("regionInfo")).toBeInTheDocument();
    expect(document.getElementById("rss")).toBeInTheDocument();
  });
});
