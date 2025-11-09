import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Row, Col, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import SpaceCard from '../space-card';
import Empty from '../empty';
import styles from './index.module.scss';
import useSpaceStore from '@/store/space-store';
import { visitSpace, joinEnterpriseSpace } from '@/services/space';

interface SpaceItem {
  id: string;
  avatarUrl?: string;
  name: string;
  description: string;
  ownerName: string;
  memberCount: number;
  status?: string; // 空间状态
  university?: string;
  // 向后兼容的旧属性
  isOwner?: boolean;
  isMember?: boolean;
  isPending?: boolean;
  canJoin?: boolean;
}

interface SpaceListProps {
  dataSource: SpaceItem[];
  loading: boolean;
  activeTab: string;
  refresh?: () => void;
  staticSize?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  minCardWidth?: number; // 最小卡片宽度，默认 460
}

const SpaceList: React.FC<SpaceListProps> = ({
  dataSource,
  loading,
  activeTab,
  refresh,
  staticSize = true,
  prefix,
  suffix,
  minCardWidth = 460,
}) => {
  const navigate = useNavigate();
  const { spaceType, setSpaceId, setSpaceName, setSpaceAvatar } =
    useSpaceStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [colSpan, setColSpan] = useState<number>(24);

  const computeColSpan = useCallback(
    (width: number) => {
      const candidates = [3, 4, 6]; // 最小两列
      const possible = candidates.filter(c => width / c >= minCardWidth);
      const cols = possible.length > 0 ? Math.max(...possible) : 3; // 至少两列
      return 24 / cols;
    },
    [minCardWidth]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth || window.innerWidth;
      setColSpan(computeColSpan(width));
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, [computeColSpan, minCardWidth]);

  // 申请进入空间
  const spaceApply = useCallback(
    async (space: SpaceItem) => {
      try {
        await joinEnterpriseSpace({ spaceId: `${space.id}` });
        message.success('申请成功');
        refresh?.();
      } catch (err) {
        // message.error();
      }
    },
    [refresh]
  );

  // 处理按钮点击事件
  const handleButtonClick = useCallback(
    async (action: string, space: SpaceItem) => {
      try {
        const enterSpace = async () => {
          await visitSpace(space.id);
          setSpaceId(space.id);
          setSpaceName(space.name);
          setSpaceAvatar(space.avatarUrl || '');
          navigate(`/space/space-detail/${space.id}`);
        };

        switch (action) {
          case 'enter':
            enterSpace();
            break;
          case 'join':
            // 处理申请加入
            console.log('申请加入空间:', space.id);
            spaceApply(space);
            break;
          case 'pending':
            // 处理申请中状态
            console.log('查看申请状态:', space.id);
            break;
          case 'noPermission':
            // 处理无权限情况
            console.log('无权限访问空间:', space.id);
            break;
          case 'custom':
            // 处理自定义操作
            console.log('自定义操作:', space.id);
            break;
          default:
            console.log('未知操作:', action, space.id);
        }
      } catch (error: any) {
        message.error(error.msg || error.desc || '访问空间失败');
      }
    },
    [navigate, setSpaceId, setSpaceName, spaceApply]
  );

  const content = useMemo(() => {
    if (!staticSize) {
      return (
        <Row gutter={[24, 24]}>
          {prefix && (
            <Col span={colSpan} className={styles.spaceCol}>
              {prefix}
            </Col>
          )}
          {dataSource.map(space => (
            <Col key={space.id} span={colSpan} className={styles.spaceCol}>
              <SpaceCard
                style={{ width: '100%' }}
                spaceType={spaceType}
                space={space}
                onButtonClick={handleButtonClick}
              />
            </Col>
          ))}
          {suffix && (
            <Col span={colSpan} className={styles.spaceCol}>
              {suffix}
            </Col>
          )}
        </Row>
      );
    }

    return (
      <>
        {prefix && prefix}
        {dataSource.map(space => (
          <SpaceCard
            key={space.id}
            spaceType={spaceType}
            space={space}
            onButtonClick={handleButtonClick}
          />
        ))}
        {suffix && suffix}
      </>
    );
  }, [
    prefix,
    suffix,
    dataSource,
    spaceType,
    handleButtonClick,
    staticSize,
    colSpan,
  ]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={classNames(styles.spaceList, staticSize && styles.static)}
    >
      {content}
      {dataSource.length === 0 && !prefix && !suffix && (
        <Empty text="暂无空间，请先创建" />
      )}
    </div>
  );
};

export default SpaceList;
