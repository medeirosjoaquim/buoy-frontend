import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { MemoryRouter } from "react-router-dom";
import { AppLayoutContext, AppLayoutContextType } from "components/layout";
import messages from "intl/messages/en.json";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

const mockAppLayoutContext: AppLayoutContextType = {
  sidebarItems: [],
  addSidebarItem: () => {},
  contentMinWidth: "65vw",
  contentMaxWidth: "1100px",
};

interface WrapperProps {
  children: React.ReactNode;
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderWithProvidersOptions
) {
  const { initialEntries = ["/users"], ...renderOptions } = options || {};
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider messages={messages} locale="en">
            <AppLayoutContext.Provider value={mockAppLayoutContext}>
              {children}
            </AppLayoutContext.Provider>
          </IntlProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}
