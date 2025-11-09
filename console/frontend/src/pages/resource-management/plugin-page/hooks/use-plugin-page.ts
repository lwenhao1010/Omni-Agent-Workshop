import globalStore from '@/store/global-store';
import useUserStore, { User } from '@/store/user-store';
import { ToolItem } from '@/types/resource';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

export const usePluginPage = (): {
  user: User;
  tools: ToolItem[];
  getTools: (value?: string) => void;
  getToolsDebounce: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isHovered: boolean | null;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean | null>>;
  deleteModal: boolean;
  setDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentTool: ToolItem;
  setCurrentTool: React.Dispatch<React.SetStateAction<ToolItem>>;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
} => {
  const user = useUserStore(state => state.user);
  const tools = globalStore(state => state.tools);
  const getTools = globalStore(state => state.getTools);

  const [isHovered, setIsHovered] = useState<boolean | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolItem>({} as ToolItem);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    getTools();
  }, []);

  const getToolsDebounce = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      getTools(value?.trim());
    }, 500),
    [searchValue]
  );

  return {
    user,
    tools,
    getTools,
    getToolsDebounce,
    isHovered,
    setIsHovered,
    deleteModal,
    setDeleteModal,
    currentTool,
    setCurrentTool,
    searchValue,
    setSearchValue,
  };
};
