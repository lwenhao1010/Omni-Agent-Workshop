import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Tag, message, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import SpaceTable, {
  SpaceColumnConfig,
  ActionColumnConfig,
  QueryParams,
  QueryResult,
  SpaceTableRef,
} from '@/components/space/space-table';
import { ButtonConfig } from '@/components/button-group';
import { ModuleType, OperationType } from '@/types/permission';
import SpaceTag from '@/components/space/space-tag';

import styles from './index.module.scss';

import { getSpaceInviteList, revokeSpaceInvite } from '@/services/space';
import { STATUS_THEME_MAP_INVITE, PENDING_STATUS } from '@/pages/space/config';
import { useSpaceI18n } from '@/pages/space/hooks/use-space-i18n';

interface Invitation {
  id: string;
  inviteeNickname: string;
  status: number;
  createTime: string;
  avatar?: string;
}

interface InvitationManagementProps {
  spaceId: string;
  searchValue?: string;
  statusFilter?: string;
}

export interface InvitationManagementRef {
  reload: () => void;
}

const InvitationManagement = forwardRef<
  InvitationManagementRef,
  InvitationManagementProps
>(
  (
    {
      spaceId,
      searchValue: externalSearchValue = '',
      statusFilter: externalStatusFilter = 'all',
    },
    ref
  ) => {
    const tableRef = useRef<SpaceTableRef>(null);
    const { invitationStatusTextMap } = useSpaceI18n();

    useImperativeHandle(ref, () => ({
      reload: () => {
        tableRef.current?.reload();
      },
    }));

    // 查询邀请数据的函数
    const queryInvitations = async (
      params: QueryParams
    ): Promise<QueryResult<Invitation>> => {
      // 模拟后端根据参数返回过滤后的数据
      console.log('邀请管理 API 请求参数:', {
        current: params.current,
        pageSize: params.pageSize,
        searchValue: params.searchValue,
        statusFilter: params.roleFilter, // 这里使用 roleFilter 传递状态筛选
      });

      try {
        const { current, pageSize, searchValue, roleFilter: status } = params;

        const res: any = await getSpaceInviteList({
          pageNum: current,
          pageSize,
          nickname: searchValue,
          status,
        });

        const { records, total } = res;
        return {
          data: records,
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
    };

    const handleRevokeInvitation = (
      invitationId: string,
      inviteeNickname: string
    ) => {
      Modal.confirm({
        title: '确认撤回',
        content: `确定要撤回对 "${inviteeNickname}" 的邀请吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          try {
            await revokeSpaceInvite({ inviteId: invitationId });

            message.success('撤回成功');
          } catch (error: any) {
            message.error(error?.msg || error?.desc);
          } finally {
            tableRef?.current?.reload();
          }
        },
      });
    };

    const getStatusTag = useCallback(
      (status: number) => {
        const theme =
          STATUS_THEME_MAP_INVITE[
            String(status) as keyof typeof STATUS_THEME_MAP_INVITE
          ];
        return (
          <SpaceTag theme={theme}>
            {
              invitationStatusTextMap[
                String(status) as keyof typeof invitationStatusTextMap
              ]
            }
          </SpaceTag>
        );
      },
      [invitationStatusTextMap]
    );

    const getActionButtons = (invitation: Invitation): ButtonConfig[] => {
      if (invitation.status !== Number(PENDING_STATUS)) {
        return [];
      }

      return [
        {
          key: 'recall',
          text: '撤回',
          type: 'link',
          size: 'small',
          permission: {
            module: ModuleType.SPACE,
            operation: OperationType.INVITATION_MANAGE,
          },
          onClick: () =>
            handleRevokeInvitation(invitation.id, invitation.inviteeNickname),
        },
      ];
    };

    // 列配置
    const columns: SpaceColumnConfig<Invitation>[] = [
      {
        title: '用户名',
        dataIndex: 'inviteeNickname',
        key: 'inviteeNickname',
        render: (text: string, record: Invitation) => (
          <div className={styles.inviteeNicknameCell}>
            <span>{text}</span>
          </div>
        ),
      },
      {
        title: '邀请状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: number) => getStatusTag(status),
      },
      {
        title: '加入时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (text: string) => (
          <span className={styles.createTime}>{text || '-'}</span>
        ),
      },
    ];

    // 操作列配置
    const actionColumn: ActionColumnConfig<Invitation> = {
      title: '操作',
      width: 200,
      getActionButtons: (record: Invitation) => getActionButtons(record),
    };

    return (
      <div className={styles.invitationManagement}>
        <SpaceTable<Invitation>
          ref={tableRef}
          queryData={queryInvitations}
          columns={columns}
          actionColumn={actionColumn}
          rowKey="id"
          extraParams={{
            spaceId,
            searchValue: externalSearchValue,
            roleFilter: externalStatusFilter,
          }}
          className={styles.invitationTable}
        />
      </div>
    );
  }
);

export default InvitationManagement;
