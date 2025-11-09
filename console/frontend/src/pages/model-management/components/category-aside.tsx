import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { Spin } from 'antd';
import IntegerStep from './integer-step';
import {
  CategoryNode,
  CategoryAsideRef,
  CategoryAsideProps,
  CategorySource,
} from '@/types/model';
import { useTranslation } from 'react-i18next';
// 提取渲染节点函数参数接口
interface RenderNodeParams {
  node: CategoryNode;
  depth: number;
  checkedLeafMap: Map<number, CategoryNode>;
  handleCheck: (node: CategoryNode, checked: boolean) => void;
  styles: {
    oneLevelNameStyle: React.CSSProperties;
    childNameStyle: React.CSSProperties;
  };
}

const renderCategoryNode = ({
  node,
  depth,
  checkedLeafMap,
  handleCheck,
  styles,
}: RenderNodeParams): React.ReactNode => {
  const hasChild = node.children.length > 0;
  const indent = depth * 5;

  if (node.key === 'contextLengthTag') return null;

  return (
    <div key={`${node.key}-${node.id}`}>
      <div
        className="flex items-center py-2 px-3 rounded-md"
        style={{ paddingLeft: 12 + indent }}
      >
        {!hasChild ? (
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded-[3px] bg-white border border-[#E4EAFF] accent-[#275EFF] focus:ring-2 focus:ring-blue-500/20"
            checked={checkedLeafMap.has(node.id)}
            onChange={(e): void => handleCheck(node, e.target.checked)}
          />
        ) : (
          <span style={{ width: 20 }} />
        )}

        <span
          style={hasChild ? styles.oneLevelNameStyle : styles.childNameStyle}
        >
          {node.name}
        </span>
      </div>

      {hasChild && (
        <div className="pl-4">
          {node.children.map(child =>
            renderCategoryNode({
              node: child,
              depth: depth + 1,
              checkedLeafMap,
              handleCheck,
              styles,
            })
          )}
        </div>
      )}
    </div>
  );
};

const CategoryAside = forwardRef<CategoryAsideRef, CategoryAsideProps>(
  (
    {
      tree,
      onSelect,
      onContextLengthChange,
      defaultCheckedNodes = [],
      defaultContextLength,
      setContextMaxLength,
      loading = false,
    },
    ref
  ) => {
    const { t } = useTranslation();

    // 用一个 ref 记录是否已经渲染过统一的 IntegerStep
    const sliderRenderedRef = useRef(false);

    /* ---------- 叶子节点勾选状态 ---------- */
    const [checkedLeafMap, setCheckedLeafMap] = useState<
      Map<number, CategoryNode>
    >(() => {
      const map = new Map<number, CategoryNode>();
      defaultCheckedNodes.forEach(n => map.set(n.id, n));
      return map;
    });

    const [sliderValue, setSliderValue] = useState<number | undefined>(
      defaultContextLength
    );

    /* ---------- 供父组件调用的方法 ---------- */
    useImperativeHandle(ref, () => ({
      getCheckedLeafNodes: (): CategoryNode[] =>
        Array.from(checkedLeafMap.values()),
      getContextLengthValue: (): number | undefined => sliderValue, // 暴露给父组件
    }));

    /* ---------- 勾选 / 取消勾选 ---------- */
    const handleCheck = (node: CategoryNode, checked: boolean): void => {
      const newMap = new Map(checkedLeafMap);
      if (checked) {
        newMap.set(node.id, node);
      } else {
        newMap.delete(node.id);
      }
      setCheckedLeafMap(newMap);
      sliderRenderedRef.current = false;
      onSelect?.(Array.from(newMap.values()));
    };

    const oneLevelNameStyle = {
      fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif', // 苹方
      fontSize: 14,
      fontWeight: 700,
      lineHeight: '16px',
      letterSpacing: 'normal',
      color: '#333333',
    };

    const childNameStyle = {
      fontFamily: 'PingFang SC',
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: '16px',
      letterSpacing: 'normal',
      color: '#333333',
    };

    // 找出所有 contextLengthTag 叶子，并提取最大数字
    const contextLengthLeaves = useMemo((): CategoryNode[] => {
      const leaves: CategoryNode[] = [];
      function dfs(list: CategoryNode[]): void {
        list.forEach((n): void => {
          if (n.key === 'contextLengthTag' && !n.children.length) {
            leaves.push(n);
          }
          if (n.children.length) dfs(n.children);
        });
      }
      dfs(tree);
      return leaves;
    }, [tree]);

    const contextMax = useMemo((): number => {
      const num = contextLengthLeaves.map((n): number => {
        const m = String(n.name).match(/(\d+)/);
        return m ? Number(m[1]) : 0;
      });
      return num.length ? Math.max(...num) : 100; // 兜底 100
    }, [contextLengthLeaves]);

    useEffect(() => {
      setContextMaxLength?.(contextMax);
    }, [contextMax, setContextMaxLength]);

    /* ---------- 递归渲染 ---------- */
    /* ---------- 渲染 ---------- */
    return (
      <Spin spinning={loading} size="default">
        <div className="p-4 ">
          <div>
            {tree.map(node =>
              renderCategoryNode({
                node,
                depth: 0,
                checkedLeafMap,
                handleCheck,
                styles: { oneLevelNameStyle, childNameStyle },
              })
            )}

            <span className=" flex pl-7 pt-1" style={oneLevelNameStyle}>
              {t('model.contextLength')}
            </span>
            {contextLengthLeaves.length > 0 && (
              <div className="flex items-center py-2 px-3">
                <span style={{ width: 15 }} />
                <IntegerStep
                  value={sliderValue}
                  max={contextMax}
                  onChange={(val): void => {
                    setSliderValue(val);
                    onContextLengthChange?.(val);
                  }}
                  defaultValue={0}
                />
              </div>
            )}

            {/* -------------- 模型状态-------------- */}
            <span className="flex pl-7 pt-1" style={oneLevelNameStyle}>
              {t('model.modelStatus')}
            </span>

            {/* "已下架" */}
            <div className="flex items-center py-2 pl-8">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 rounded-[3px] bg-white border border-[#E4EAFF] accent-[#275EFF] focus:ring-2 focus:ring-blue-500/20"
                onChange={(e): void => {
                  const checked = e.target.checked;
                  // 这里把"已下架"当作一个特殊节点 id = -1
                  const dummy: CategoryNode = {
                    id: -1,
                    key: 'offShelf',
                    name: t('model.offShelf'),
                    sortOrder: 0,
                    children: [],
                    source: CategorySource.SYSTEM,
                  };
                  handleCheck(dummy, checked);
                }}
              />
              <span style={childNameStyle}>{t('model.offShelf')}</span>
            </div>

            {/* "即将下架" */}
            <div className="flex items-center py-2 pl-8">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 rounded-[3px] bg-white border border-[#E4EAFF] accent-[#275EFF] focus:ring-2 focus:ring-blue-500/20"
                onChange={(e): void => {
                  const checked = e.target.checked;
                  // 把"即将下架"当作一个特殊节点 id = -2
                  const dummy: CategoryNode = {
                    id: -2,
                    key: 'toBeOffShelf',
                    name: t('model.toBeOffShelf'),
                    sortOrder: 0,
                    children: [],
                    source: CategorySource.SYSTEM,
                  };
                  handleCheck(dummy, checked);
                }}
              />
              <span style={childNameStyle}>{t('model.toBeOffShelf')}</span>
            </div>
          </div>
        </div>
      </Spin>
    );
  }
);

CategoryAside.displayName = 'CategoryAside';

export default CategoryAside;
