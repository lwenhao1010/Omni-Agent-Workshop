import { useMemo, useCallback } from 'react';
import { useModelContext } from '../context/model-context';
import { ModelInfo, CategoryNode, ShelfStatus } from '@/types/model';

/**
 * 模型筛选Hook
 * 负责模型的筛选逻辑和筛选条件管理
 */
export const useModelFilters = (): {
  filteredModels: ModelInfo[];
  checkedLeaves: CategoryNode[];
  contextLength?: number;
  contextMaxLength?: number;
  searchInput: string;
  filterType: number;
  showShelfOnly: boolean;
  handleCategorySelect: (checkedLeaves: CategoryNode[]) => void;
  handleContextLengthChange: (length?: number) => void;
  handleSearchInputChange: (value: string) => void;
  handleFilterTypeChange: (type: number) => void;
  handleSetContextMaxLength: (length: number) => void;
} => {
  const { state, actions } = useModelContext();

  // 递归：只要树（或子树）里出现任何一个 name 在 required 中就返回 true
  const treeContainsAnyLeaf = useCallback(
    (node: CategoryNode, required: Set<string>): boolean => {
      // 如果当前节点本身就是叶子且 name 命中
      if (!node.children?.length) {
        return required.has(node.name);
      }
      // 否则递归它的孩子
      return node.children.some((child: CategoryNode) =>
        treeContainsAnyLeaf(child, required)
      );
    },
    []
  );

  // 上下文长度筛选判断
  const treeContainsContextLengthGreaterThan = useCallback(
    (node: CategoryNode, val: number): boolean => {
      if (!node.children?.length) {
        if (node.key !== 'contextLengthTag') return false;

        const m = String(node.name).match(/(\d+)/);
        const num = m ? Number(m[1]) : 0;
        return num <= val;
      }
      return node.children.some((child: CategoryNode) =>
        treeContainsContextLengthGreaterThan(child, val)
      );
    },
    []
  );

  // 筛选模型
  const filterModels = useCallback(
    (
      models: ModelInfo[],
      checkedLeaves: CategoryNode[],
      contextLength?: number
    ): ModelInfo[] => {
      let ret = models;

      /* 1. 把"已下架""即将下架"从普通分类节点里拆出来 */
      const offShelfNode = checkedLeaves.find(n => n.id === -1); // "已下架"
      const toBeOffShelfNode = checkedLeaves.find(n => n.id === -2); // "即将下架"

      /* 2. 根据 shelfStatus 过滤 */
      if (offShelfNode || toBeOffShelfNode) {
        ret = ret.filter(m => {
          if (offShelfNode && m.shelfStatus === ShelfStatus.OFF_SHELF)
            return true; // 已下架
          if (toBeOffShelfNode && m.shelfStatus === ShelfStatus.WAIT_OFF_SHELF)
            return true; // 即将下架
          return false;
        });
      }

      /* 3. 普通分类节点过滤（排除 -1、-2 这两个伪节点） */
      const realLeaves = checkedLeaves.filter(
        n => n.id !== -1 && n.id !== -2 && n.name !== '多语言'
      );
      if (realLeaves.length) {
        const required = new Set(realLeaves.map(n => n.name));
        ret = ret.filter(model =>
          model.categoryTree?.some((tree: CategoryNode) =>
            treeContainsAnyLeaf(tree, required)
          )
        );
      }

      /* 4. 上下文长度过滤 */
      if (contextLength != null) {
        if (contextLength !== 0 && contextLength !== state.contextMaxLength) {
          ret = ret.filter(model =>
            model.categoryTree?.some((tree: CategoryNode) =>
              treeContainsContextLengthGreaterThan(tree, contextLength)
            )
          );
        }
      }

      return ret;
    },
    [
      treeContainsAnyLeaf,
      treeContainsContextLengthGreaterThan,
      state.contextMaxLength,
    ]
  );

  // 过滤后的模型列表
  const filteredModels = useMemo(() => {
    let models = state.models;

    // 如果只显示即将下架的模型
    if (state.showShelfOnly) {
      models = state.shelfOffModels;
    }

    // 应用分类筛选
    models = filterModels(models, state.checkedLeaves, state.contextLength);

    // 应用搜索筛选
    if (state.searchInput.trim()) {
      const searchLower = state.searchInput.toLowerCase();
      models = models.filter(m => m.name.toLowerCase().includes(searchLower));
    }

    return models;
  }, [
    state.models,
    state.shelfOffModels,
    state.showShelfOnly,
    state.checkedLeaves,
    state.contextLength,
    state.searchInput,
    filterModels,
  ]);

  // 处理分类选择变化
  const handleCategorySelect = useCallback(
    (checkedLeaves: CategoryNode[]): void => {
      actions.setCheckedLeaves(checkedLeaves);
    },
    [actions]
  );

  // 处理上下文长度变化
  const handleContextLengthChange = useCallback(
    (length?: number): void => {
      actions.setContextLength(length);
    },
    [actions]
  );

  // 处理搜索输入变化
  const handleSearchInputChange = useCallback(
    (value: string): void => {
      actions.setSearchInput(value);
    },
    [actions]
  );

  // 处理筛选类型变化（个人模型）
  const handleFilterTypeChange = useCallback(
    (type: number): void => {
      actions.setFilterType(type);
    },
    [actions]
  );

  // 设置上下文最大长度
  const handleSetContextMaxLength = useCallback(
    (length: number): void => {
      actions.setContextMaxLength(length);
    },
    [actions]
  );

  return {
    // 筛选结果
    filteredModels,

    // 筛选条件
    checkedLeaves: state.checkedLeaves,
    contextLength: state.contextLength,
    contextMaxLength: state.contextMaxLength,
    searchInput: state.searchInput,
    filterType: state.filterType,
    showShelfOnly: state.showShelfOnly,

    // 筛选方法
    handleCategorySelect,
    handleContextLengthChange,
    handleSearchInputChange,
    handleFilterTypeChange,
    handleSetContextMaxLength,
  };
};
