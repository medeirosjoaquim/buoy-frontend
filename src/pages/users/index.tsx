import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Avatar, Input, Space, Card } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import type { InputRef } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ContentLayout from "components/layout/content/contentLayout";
import { useGetUsers } from "hooks/react-query/users";
import { User } from "services/users/interface";

type DataIndex = keyof User;

export function Users() {
  const { data, isLoading } = useGetUsers();
  const [searchText, setSearchText] = useState<Record<string, string>>({});
  const searchInput = useRef<InputRef>(null);
  const navigate = useNavigate();

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText((prev) => ({ ...prev, [dataIndex]: selectedKeys[0] }));
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    clearFilters();
    confirm();
    setSearchText((prev) => ({ ...prev, [dataIndex]: "" }));
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<User> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <button
            type="button"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            style={{ width: 90 }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
            style={{ width: 90 }}
          >
            Reset
          </button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const columns: ColumnsType<User> = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 70,
      },
      {
        title: "First name",
        dataIndex: "firstName",
        key: "firstName",
        ...getColumnSearchProps("firstName"),
      },
      {
        title: "Last name",
        dataIndex: "lastName",
        key: "lastName",
        ...getColumnSearchProps("lastName"),
      },
      {
        title: "Name",
        key: "name",
        render: (_, record) => `${record.firstName} ${record.lastName}`,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sorter: (a, b) => a.email.localeCompare(b.email),
      },
      {
        title: "Image",
        dataIndex: "image",
        key: "image",
        width: 80,
        render: (image: string) => (
          /**
           * Using Avatar component instead of raw <img> for several reasons:
           * 1. Consistent circular styling that matches the user-centric context
           * 2. Built-in fallback handling if image fails to load
           * 3. Optimized size (48px) balances visibility with table row density
           * 4. Avatar is semantically appropriate for user profile images
           */
          <Avatar src={image} size={48} />
        ),
      },
    ],
    [searchText]
  );

  return (
    <ContentLayout>
      <Card title="Users" style={{ width: "100%" }}>
        <Table<User>
          columns={columns}
          dataSource={data?.users}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 13,
            showSizeChanger: false,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/users/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </ContentLayout>
  );
}
