import { Button, Col, Form, Image, Input, Layout, Row, Typography } from "antd";
import React, { useState } from "react";
import { theme } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import LoginService from "services/login";
import { updateAuth } from "store/auth";
import { useAppDispatch } from "hooks";
import { login_big, login_logo } from "assets";
import { useIntl } from "react-intl";

const { Content } = Layout;
const { Title } = Typography;

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { formatMessage } = useIntl();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    token: { colorPrimary, padding },
  } = theme.useToken();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    const { email, password } = values;

    try {
      const response = await LoginService.login({ email, password });

      dispatch(
        updateAuth({
          accessToken: response.access,
          refreshToken: response.refresh,
        })
      );
    } catch (error) {
      console.error(error);
      setError("Correo o contraseña inválida");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Content>
        <style>
          {`
            .login-form .ant-input,
            .login-form .ant-input-password {
              background: rgba(255, 255, 255, 0.06) !important;
              border: 1px solid rgba(255, 255, 255, 0.12) !important;
              border-radius: 8px !important;
              height: 56px !important;
              font-size: 16px !important;
              padding: 12px 16px !important;
            }
            .login-form .ant-input:hover,
            .login-form .ant-input-password:hover {
              border-color: rgba(2, 245, 157, 0.4) !important;
              background: rgba(255, 255, 255, 0.08) !important;
            }
            .login-form .ant-input:focus,
            .login-form .ant-input-affix-wrapper-focused {
              border-color: #02f59d !important;
              background: rgba(255, 255, 255, 0.1) !important;
              box-shadow: 0 0 0 3px rgba(2, 245, 157, 0.15) !important;
            }
            .login-form .ant-input-affix-wrapper {
              padding: 12px 16px !important;
            }
            .login-form .ant-input-password .ant-input {
              height: auto !important;
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 0 0 8px !important;
              font-size: 16px !important;
            }
            .login-form .ant-input-password .ant-input-suffix {
              margin-right: 0;
            }
            .login-form .ant-input-password .ant-input-suffix .anticon {
              color: rgba(255, 255, 255, 0.45);
              font-size: 16px;
              transition: color 0.2s ease;
            }
            .login-form .ant-input-password .ant-input-suffix .anticon:hover {
              color: #02f59d;
            }
            .login-form .ant-input::placeholder {
              color: rgba(255, 255, 255, 0.35);
            }
            .login-form .ant-form-item {
              margin-bottom: 20px;
            }
            .login-form .ant-btn-primary {
              height: 56px !important;
              font-size: 16px !important;
              font-weight: 500 !important;
              border-radius: 8px !important;
              box-shadow: 0 4px 14px rgba(2, 245, 157, 0.35) !important;
              transition: all 0.25s ease !important;
            }
            .login-form .ant-btn-primary:hover {
              transform: translateY(-1px);
              box-shadow: 0 6px 20px rgba(2, 245, 157, 0.45) !important;
            }
            .login-form .ant-btn-primary:active {
              transform: translateY(0);
            }
            .login-title {
              font-weight: 300 !important;
              letter-spacing: -0.5px;
              margin-bottom: 40px !important;
              background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .login-form-container {
              animation: fadeInUp 0.6s ease-out;
            }
          `}
        </style>
        <Row style={{ height: "100vh" }}>
          <Col span={12} style={{ height: "100vh" }}>
            <Row align="middle" justify="center" style={{ height: "100vh" }}>
              <Col span={16} style={{ maxWidth: 420 }} className="login-form-container">
                <Title level={2} className="login-title" style={{ textAlign: "center" }}>
                  {formatMessage({ id: "login.form.title" })}
                </Title>

                <Form name="login" onFinish={handleLogin} className="login-form" size="large">
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: "Introduce tu email" }]}
                    validateStatus={error ? "error" : undefined}
                  >
                    <Input
                      type="email"
                      placeholder="Email"
                      prefix={<MailOutlined style={{ color: "rgba(255,255,255,0.35)", marginRight: 8 }} />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Introduce tu contraseña" }]}
                    validateStatus={error ? "error" : undefined}
                    help={error && <span style={{ color: "#ff6b6b" }}>{error}</span>}
                  >
                    <Input.Password
                      placeholder="Contraseña"
                      prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.35)", marginRight: 8 }} />}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginTop: 32 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ width: "100%" }}
                      loading={loading}
                    >
                      {formatMessage({ id: "login.form.button" })}
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Col>
          <Col span={12} style={{ height: "100vh", background: colorPrimary }}>
            <Row align="middle" justify="center" style={{ height: "100vh" }}>
              <Col style={{ paddingLeft: padding * 4, paddingRight: padding * 4 }}>
                <Image
                  src={login_big}
                  preview={false}
                  style={{ maxHeight: "50vh" }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default LoginScreen;
