import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { message, Modal, Tag } from 'antd';
import SpaceTable, {
  SpaceColumnConfig,
  ActionColumnConfig,
  QueryParams,
  QueryResult,
  SpaceTableRef,
} from '@/components/space/space-table';
import { ButtonConfig } from '@/components/button-group';
import SpaceTag from '@/components/space/space-tag';
import {
  getEnterpriseInviteList,
  revokeEnterpriseInvite,
} from '@/services/enterprise';
import { STATUS_THEME_MAP_INVITE, PENDING_STATUS } from '@/pages/space/config';
import { useSpaceI18n } from '@/pages/space/hooks/use-space-i18n';

interface InvitationData {
  id: string;
  inviterUid: string;
  inviteeNickname: string;
  createTime: string;
  status: number;
}

interface InvitationListProps {
  searchValue: string;
  statusFilter: string;
}

export interface InvitationListRef {
  reload: () => void;
}

const InvitationList = forwardRef<InvitationListRef, InvitationListProps>(
  ({ searchValue, statusFilter }, ref) => {
    const tableRef = useRef<SpaceTableRef>(null);
    const { invitationStatusTextMap } = useSpaceI18n();
    // 模拟查询邀请数据的函数
    const queryInvitationData = useCallback(
      async (params: QueryParams): Promise<QueryResult<InvitationData>> => {
        // 模拟后端根据参数返回过滤后的数据
        console.log('邀请管理 API 请求参数:', {
          current: params.current,
          pageSize: params.pageSize,
          searchValue: params.searchValue,
          statusFilter: params.roleFilter, // 这里使用 roleFilter 传递状态筛选
        });

        try {
          const {
            current: pageNum,
            pageSize,
            searchValue,
            roleFilter: status,
          } = params;
          const res: any = await getEnterpriseInviteList({
            pageNum,
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
          console.log(
            err,
            '------------- getEnterpriseInviteList -------------'
          );

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

    useImperativeHandle(ref, () => ({
      reload: () => {
        tableRef.current?.reload();
      },
    }));

    // 获取状态标签
    const getStatusTag = useCallback(
      (status: number) => {
        const key = String(status) as keyof typeof STATUS_THEME_MAP_INVITE;
        const theme = STATUS_THEME_MAP_INVITE[key];
        return (
          <SpaceTag theme={theme}>{invitationStatusTextMap[key]}</SpaceTag>
        );
      },
      [invitationStatusTextMap]
    );

    // 列配置
    const columns: SpaceColumnConfig<InvitationData>[] = useMemo(
      () => [
        {
          title: '用户名',
          dataIndex: 'inviteeNickname',
          key: 'inviteeNickname',
          width: 200,
        },
        {
          title: '邀请状态',
          dataIndex: 'status',
          key: 'status',
          width: 120,
          render: (status: number) => getStatusTag(status),
        },
        {
          title: '邀请时间',
          dataIndex: 'createTime',
          key: 'createTime',
          width: 180,
        },
      ],
      [getStatusTag]
    );

    // 处理重发邀请
    const handleResend = useCallback((record: InvitationData) => {
      message.success(`已重新发送邀请给 ${record.inviteeNickname}`);
    }, []);

    // 处理取消邀请
    const handleCancel = useCallback(async (record: InvitationData) => {
      try {
        await revokeEnterpriseInvite({ inviteId: record.id });

        message.success(`已撤回邀请用户 ${record.inviteeNickname}`);
      } catch (err: any) {
        message.error(err?.msg || err?.desc);
      } finally {
        tableRef.current?.reload();
      }
    }, []);

    // 处理删除邀请记录
    const handleDelete = useCallback((record: InvitationData) => {
      message.success(`已删除 ${record.inviteeNickname} 的邀请记录`);
    }, []);

    // 操作列配置
    const actionColumn: ActionColumnConfig<InvitationData> = useMemo(
      () => ({
        title: '操作',
        width: 100,
        getActionButtons: (record: InvitationData) => {
          if (record.status !== Number(PENDING_STATUS)) {
            return [];
          }

          const buttons: ButtonConfig[] = [
            {
              key: 'cancel',
              text: '撤回',
              type: 'link',
              onClick: () => {
                Modal.confirm({
                  title: '确认撤回邀请',
                  content: '是否确认撤回邀请该用户？',
                  okText: '确认',
                  cancelText: '取消',
                  onOk: () => handleCancel(record),
                });
              },
            },
          ];

          return buttons;
        },
      }),
      [handleResend, handleCancel, handleDelete]
    );

    return (
      <SpaceTable<InvitationData>
        ref={tableRef}
        queryData={queryInvitationData}
        columns={columns}
        actionColumn={actionColumn}
        extraParams={{
          searchValue,
          roleFilter: statusFilter,
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
  }
);

export default InvitationList;
