import { DashboardOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { Layout, Menu, theme, Row, Col } from "antd";
import { AppPath } from "components";
import { useAppNavigate } from "hooks";
import { AppLayoutContext } from "..";
import { useContext } from "react";
import type { MenuItemType } from "antd/es/menu/interface";

const { Sider } = Layout;

type AppSidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Custom collapse trigger with smooth animated chevron
 */
function CollapseTrigger({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  const {
    token: { colorPrimary },
  } = theme.useToken();

  return (
    <button
      onClick={onClick}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      style={{
        width: "100%",
        height: 48,
        border: "none",
        background: "rgba(255, 255, 255, 0.03)",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{
          transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke={colorPrimary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function AppSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
  const navigate = useAppNavigate();
  const {
    token: { controlHeight, colorBgContainer, margin },
  } = theme.useToken();

  const { sidebarItems } = useContext(AppLayoutContext);

  const topDefaultItems: MenuItemType[] = [
    {
      key: AppPath.home,
      label: "Dashboard",
      icon: <DashboardOutlined />,
    },
    {
      key: AppPath.users,
      label: "Users",
      icon: <TeamOutlined />,
    },
  ];

  const bottomDefaultItems: MenuItemType[] = [
    {
      key: AppPath.brandProfile,
      label: "Brand",
      icon: <UserOutlined />,
    },
  ];

  const allMenuItems = [
    ...topDefaultItems,
    ...sidebarItems,
    ...bottomDefaultItems,
  ];

  return (
    <Sider
      style={{
        overflowX: "hidden",
        overflowY: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: colorBgContainer,
        display: "flex",
        flexDirection: "column",
      }}
      collapsible
      collapsed={collapsed}
      trigger={null}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Row
          align="middle"
          style={{ width: "100%", marginLeft: margin, height: controlHeight * 2 }}
        />
        <Row justify="space-between" style={{ flex: 1 }}>
          <Col span={24}>
            <Menu
              mode="inline"
              items={allMenuItems}
              onClick={(event) => navigate(event.key)}
            />
          </Col>
        </Row>
      </div>
      <CollapseTrigger
        collapsed={collapsed}
        onClick={() => setCollapsed(!collapsed)}
      />
    </Sider>
  );
}
