import { useParams, useNavigate } from "react-router-dom";
import { Card, Avatar, Button, Spin, Descriptions, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import ContentLayout from "components/layout/content/contentLayout";
import { useGetUserById } from "hooks/react-query/users";
import { AppPath } from "components/layout";

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);

  const { data: user, isLoading, isError } = useGetUserById(userId);

  const handleBackClick = () => {
    navigate(AppPath.users);
  };

  return (
    <ContentLayout>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackClick}
        >
          Back to Users
        </Button>

        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        )}

        {isError && (
          <Card>
            <p>Error loading user details. Please try again.</p>
          </Card>
        )}

        {!isLoading && user && (
          <Card title="User Details" style={{ width: "100%" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Space size="large" align="center">
                <Avatar src={user.image} size={96} />
                <div>
                  <h2 style={{ margin: 0 }}>
                    {user.firstName} {user.lastName}
                  </h2>
                  <p style={{ margin: 0, color: "#666" }}>{user.email}</p>
                </div>
              </Space>

              <Descriptions column={1} bordered>
                <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
                <Descriptions.Item label="First Name">
                  {user.firstName}
                </Descriptions.Item>
                <Descriptions.Item label="Last Name">
                  {user.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        )}
      </Space>
    </ContentLayout>
  );
}
