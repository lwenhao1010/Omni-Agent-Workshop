import { listRepos } from '@/services/knowledge';
import { RepoItem } from '@/types/resource';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export const useKnowledgePage = (): {
  loading: React.RefObject<boolean>;
  knowledgeRef: React.RefObject<HTMLDivElement | null>;
  deleteModal: boolean;
  setDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  createModal: boolean;
  setCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentKnowledge: RepoItem;
  setCurrentKnowledge: React.Dispatch<React.SetStateAction<RepoItem>>;
  isHovered: boolean | null;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean | null>>;
  knowledges: RepoItem[];
  setKnowledges: React.Dispatch<React.SetStateAction<RepoItem[]>>;
  pageNo: number;
  setPageNo: React.Dispatch<React.SetStateAction<number>>;
  hasMore: boolean;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  getKnowledges: (value?: string) => void;
  getRobotsDebounce: (e: React.ChangeEvent<HTMLInputElement>) => void;
} => {
  const loading = useRef<boolean>(false);
  const knowledgeRef = useRef<HTMLDivElement | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [currentKnowledge, setCurrentKnowledge] = useState<RepoItem>(
    {} as RepoItem
  );
  const [isHovered, setIsHovered] = useState<boolean | null>(null);
  const [knowledges, setKnowledges] = useState<RepoItem[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    getKnowledges();
  }, []);

  const getRobotsDebounce = useCallback(
    debounce(e => {
      const value = e.target.value;
      setSearchValue(value);
      getKnowledges(value);
    }, 500),
    [searchValue]
  );

  function getKnowledges(value?: string): void {
    loading.current = true;
    if (knowledgeRef.current) {
      knowledgeRef.current.scrollTop = 0;
    }
    const params = {
      pageNo: 1,
      pageSize: 20,
      content: value !== undefined ? value?.trim() : searchValue,
    };
    listRepos(params)
      .then(data => {
        const newKnowledges = data.pageData?.map(item => ({
          ...item,
          tagDtoList: item.tagDtoList,
        }));
        setKnowledges([...(newKnowledges || [])]);
        setPageNo(() => 2);
        if (20 < data.totalCount) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      })
      .finally(() => (loading.current = false));
  }

  useEffect(() => {
    const element = knowledgeRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
    }

    return (): void => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pageNo, hasMore, searchValue]);

  function handleScroll(): void {
    const element = knowledgeRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;

    if (
      scrollTop + clientHeight >= scrollHeight - 100 &&
      !loading.current &&
      hasMore
    ) {
      loading.current = true;
      moreKnowledges();
    }
  }

  function moreKnowledges(): void {
    const params = {
      pageNo: pageNo,
      pageSize: 20,
      content: searchValue,
    };
    listRepos(params).then(data => {
      const newKnowledges = data.pageData?.map(item => ({
        ...item,
        tagDtoList: item.tagDtoList,
      }));
      setKnowledges([...knowledges, ...(newKnowledges || [])]);
      setPageNo(pageNo => pageNo + 1);
      if (knowledges.length + 20 < data.totalCount) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      loading.current = false;
    });
  }
  return {
    loading,
    knowledgeRef,
    deleteModal,
    setDeleteModal,
    createModal,
    setCreateModal,
    currentKnowledge,
    setCurrentKnowledge,
    isHovered,
    setIsHovered,
    knowledges,
    setKnowledges,
    pageNo,
    setPageNo,
    hasMore,
    setHasMore,
    searchValue,
    setSearchValue,
    getRobotsDebounce,
    getKnowledges,
  };
};
