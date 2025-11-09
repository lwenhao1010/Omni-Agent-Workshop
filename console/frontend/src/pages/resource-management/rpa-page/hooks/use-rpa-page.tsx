import { getRpaList } from '@/services/rpa';
import { RpaInfo } from '@/types/rpa';
import { useRequest, useDebounceFn } from 'ahooks';
import React, { useState } from 'react';

export const useRpaPage = (): {
  handleSearchRpas: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isHovered: boolean | null;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean | null>>;
  rpas: RpaInfo[];
  refresh: () => void;
} => {
  const [isHovered, setIsHovered] = useState<boolean | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const { data, refresh } = useRequest(
    () =>
      getRpaList({
        name: searchValue?.trim(),
      }),
    {
      refreshDeps: [searchValue],
    }
  );

  const { run: handleSearchRpas } = useDebounceFn(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
    },
    { wait: 500 }
  );

  return {
    handleSearchRpas,
    isHovered,
    setIsHovered,
    rpas: data || [],
    refresh,
  };
};
