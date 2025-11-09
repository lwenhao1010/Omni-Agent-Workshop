import React, { useCallback, useMemo, useRef } from 'react';
import { message, Modal, Select } from 'antd';
import SpaceTable, {
  SpaceColumnConfig,
  ActionColumnConfig,
  QueryParams,
  QueryResult,
  SpaceTableRef,
} from '@/components/space/space-table';
import { ButtonConfig } from '@/components/button-group';
import { useSpaceI18n } from '@/pages/space/hooks/use-space-i18n';
import { ModuleType, OperationType } from '@/types/permission';
import { usePermissions } from '@/hooks/use-permissions';
import useUserStore from '@/store/user-store';

import {
  getEnterpriseMemberList,
  removeEnterpriseUser,
  updateEnterpriseUserRole,
} from '@/services/enterprise';
import {
  roleToRoleType,
  roleTypeToRole,
  SUPER_ADMIN_ROLE,
} from '@/pages/space/config';

const { Option } = Select;

interface MemberData {
  id: string;
  uid: string;
  nickname: string;
  role: string;
  roleText: string;
  createTime: string;
}

interface MemberListProps {
  searchValue: string;
  roleFilter: string;
}

const MemberList: React.FC<MemberListProps> = ({ searchValue, roleFilter }) => {
  const { user } = useUserStore();
  const tableRef = useRef<SpaceTableRef>(null);
  const { roleTextMap, memberRoleOptions } = useSpaceI18n();
  const permissionInfo = usePermissions();

  // 处理角色变更
  const handleRoleChange = useCallback(
    async (memberId: string, newRole: string) => {
      try {
        // API调用
        const res = await updateEnterpriseUserRole({
          uid: memberId,
          role: newRole,
        });

        message.success('角色更新成功');
        // 判断如果是操作自己，则刷新页面
        if (Number(memberId) === Number(user?.uid)) {
          window.location.reload();
        } else {
          tableRef.current?.reload();
        }
      } catch (error: any) {
        message.error(error?.msg || error?.desc);
      }
    },
    []
  );

  // 获取角色文本
  const getRoleText = useCallback(
    (role: string) => {
      return roleTextMap[roleToRoleType(Number(role), true)] || role;
    },
    [roleTextMap]
  );

  // 模拟查询成员数据的函数
  const queryMemberData = useCallback(
    async (params: QueryParams): Promise<QueryResult<MemberData>> => {
      // 模拟后端根据参数返回过滤后的数据
      console.log('API 请求参数:', {
        current: params.current,
        pageSize: params.pageSize,
        searchValue: params.searchValue,
        roleFilter: params.roleFilter,
      });

      try {
        const { current, pageSize, searchValue, roleFilter } = params;

        const res: any = await getEnterpriseMemberList({
          nickname: searchValue,
          pageNum: current,
          pageSize: pageSize,
          role: roleTypeToRole(roleFilter),
        });

        const { records, total } = res;
        return {
          data: records || [],
          total,
          success: true,
        };
      } catch (err: any) {
        message.error(err?.msg || err?.desc);
        return {
          data: [],
          total: 0,
          success: false,
        };
      }
    },
    []
  );

  // 处理删除操作
  const handleDelete = useCallback(async (record: MemberData) => {
    try {
      const res = await removeEnterpriseUser({
        uid: record.uid,
      });

      message.success(`已删除用户 ${record.nickname}`);
      tableRef.current?.reload();
    } catch (err: any) {
      message.error(err?.msg || err?.desc);
    }
  }, []);

  // 列配置
  const columns: SpaceColumnConfig<MemberData>[] = useMemo(
    () => [
      {
        title: '用户名',
        dataIndex: 'nickname',
        key: 'nickname',
        width: 200,
        render: (text: string, record: MemberData) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{text}</span>
          </div>
        ),
      },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        width: 120,
        render: (role: string, record: MemberData) => {
          const showText =
            role == SUPER_ADMIN_ROLE ||
            !permissionInfo?.checks.hasModulePermission(
              ModuleType.SPACE,
              OperationType.MODIFY_MEMBER_PERMISSIONS
            );
          if (showText) {
            return <span>{getRoleText(role)}</span>;
          }

          return (
            <Select
              value={role}
              onChange={value => handleRoleChange(record.uid, value)}
              style={{ width: '100px' }}
              popupMatchSelectWidth={false}
            >
              {memberRoleOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          );
        },
      },
      {
        title: '加入时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180,
      },
    ],
    [getRoleText, memberRoleOptions, handleRoleChange, permissionInfo]
  );

  // 操作列配置
  const actionColumn: ActionColumnConfig<MemberData> = useMemo(
    () => ({
      title: '操作',
      width: 100,
      getActionButtons: (record: MemberData) => {
        const buttons: ButtonConfig[] = [
          {
            key: 'delete',
            text: '删除',
            type: 'link',
            // danger: true,
            permission: {
              customCheck: () => {
                return !!(
                  record.role != SUPER_ADMIN_ROLE &&
                  permissionInfo?.checks.canRemoveMembers(ModuleType.SPACE) &&
                  !permissionInfo?.checks.canDeleteResource(
                    ModuleType.SPACE,
                    `${record.uid}`
                  )
                );
              },
            },
            onClick: () => {
              // 使用确认弹窗
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个成员吗？',
                okText: '确认',
                cancelText: '取消',
                onOk: () => handleDelete(record),
              });
            },
          },
        ];

        return buttons;
      },
    }),
    [handleDelete]
  );

  return (
    <SpaceTable<MemberData>
      ref={tableRef}
      queryData={queryMemberData}
      columns={columns}
      actionColumn={actionColumn}
      extraParams={{
        searchValue,
        roleFilter,
      }}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `共 ${total} 项数据`,
        pageSizeOptions: ['10', '20', '50'],
      }}
    />
  );
};

export default MemberList;
