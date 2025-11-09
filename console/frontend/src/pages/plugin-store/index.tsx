/*
 * @Author: snoopyYang
 * @Date: 2025-09-23 10:08:36
 * @LastEditors: snoopyYang
 * @LastEditTime: 2025-09-23 10:08:47
 * @Description: 插件广场
 */
import React, { useEffect, useState, useRef, memo, ReactElement } from 'react';
import { message, Select, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listToolSquare } from '@/services/tool';
import { getTags } from '@/services/square';
import { useTranslation } from 'react-i18next';
import { useDebounceFn } from 'ahooks';
import RetractableInput from '@/components/ui/global/retract-table-input';
import { Tool, ListToolSquareParams, Classify } from '@/types/plugin-store';
import type { ResponseBusinessError, ResponseResultPage } from '@/types/global';

import formSelect from '@/assets/svgs/icon-nav-dropdown.svg';
import defaultPng from '@/assets/imgs/tool-square/default.png';
// todo-newImg
import toolAuthor from '@/assets/imgs/bot-square/tool-store-author-logo.png';
import headLogo from '@/assets/imgs/bot-square/tool-store-head-logo.png';
import './style.css';

function PluginStore(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { category, searchInput, tab } = Object.fromEntries(
    searchParams.entries()
  );
  const loadingRef = useRef<boolean>(false);
  const toolRef = useRef<HTMLDivElement | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchValue, setSearchValue] = useState<{
    page: number;
    pageSize: number;
    orderFlag: number;
  }>({
    page: 1,
    pageSize: 30,
    orderFlag: category ? Number(category) : 0,
  });
  const [content, setContent] = useState(searchInput || '');
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [classifyList, setClassifyList] = useState<Classify[]>([]);
  const [classify, setClassify] = useState<string | number>(
    tab ? Number(tab) : ''
  );
  const [hoverClassify, setHoverClassify] = useState<string | number>('');
  const [tagFlag, setTagFlag] = useState<string | number>(tab ? '' : 0);

  const { run } = useDebounceFn(
    inputValue => {
      getTools(inputValue);
    },
    { wait: 500 }
  );

  const getToolsDebounce = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setContent(value);
    run(value);
  };

  const handleScroll = (): void => {
    const element = toolRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;

    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      !loadingRef.current &&
      hasMore
    ) {
      moreTools();
    }
  };

  const moreTools = (): void => {
    loadingRef.current = true;
    setLoading(true);

    const params: ListToolSquareParams = {
      ...searchValue,
      content: content?.trim(),
      tags: classify,
      tagFlag,
    };

    listToolSquare(params)
      .then((data: { pageData: Tool[]; totalCount: number }) => {
        setTools(() =>
          data?.pageData ? [...tools, ...(data?.pageData || {})] : [...tools]
        );
        setSearchValue({
          ...(searchValue || {}),
          page: searchValue.page + 1,
        });
        if (tools.length + 30 < data.totalCount) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      })
      .catch((error: ResponseBusinessError) => {
        message.error(error?.message || '获取插件列表失败');
        setTools([]);
      })
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  };

  const getTools = (value?: string, orderFlag?: number): void => {
    setLoading(true);
    setTools(() => []);
    loadingRef.current = true;
    if (toolRef.current) {
      toolRef.current.scrollTop = 0;
    }
    const params: ListToolSquareParams = {
      ...searchValue,
      page: 1,
      orderFlag: orderFlag !== undefined ? orderFlag : searchValue.orderFlag,
      content: value !== undefined ? value?.trim() : content,
      tags: classify,
      tagFlag,
    };
    listToolSquare(params)
      .then((data: ResponseResultPage<Tool>) => {
        setTools(data?.pageData || []);
        setSearchValue(searchValue => ({ ...searchValue, page: 2 }));
        if (30 < data.totalCount) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      })
      .catch((error: ResponseBusinessError) => {
        message.error(error?.message || '获取插件列表失败');
        setTools([]);
      })
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  };

  useEffect(() => {
    getTags('tool_v2')
      .then((data: Classify[]) => {
        setClassifyList(data);
      })
      .catch((error: ResponseBusinessError) => {
        message.error(error?.message);
      });
  }, []);

  useEffect(() => {
    getTools();
  }, [classify, tagFlag]);

  return (
    <div className="flex flex-col items-center justify-start w-full h-full overflow-scroll">
      {/* 1.工具栏 */}
      <div className="w-full max-w-[1425px] flex flex-col justify-start items-center pl-6 pr-[30px]">
        <div className="w-full flex justify-between pt-6 pb-[11px]">
          <div className="flex items-center gap-2.5 text-2xl font-medium leading-normal tracking-wider text-[#333333]">
            <span>{t('common.storePlugin.pluginSquare')}</span>
          </div>
        </div>
        {/* 导航栏 */}
        <div className="w-full flex items-center justify-between max-w-[1425px]">
          <div className="flex items-center">
            <div className="flex bg-[#F6F9FF]  min-h-[40px] rounded-lg flex justify-center items-center px-[4px] relative">
              <div
                className="px-4 py-1.5 rounded-lg cursor-pointer text-sm flex items-center justify-center h-[32px] font-medium"
                style={{
                  background: [hoverClassify, tagFlag].includes(0)
                    ? '#FFFFFF'
                    : '',
                  color: [hoverClassify, tagFlag].includes(0)
                    ? '#275EFF'
                    : '#757575',
                }}
                onMouseEnter={() => setHoverClassify(0)}
                onMouseLeave={() => setHoverClassify('')}
                onClick={() => {
                  setTagFlag(0);
                  setClassify('');
                }}
              >
                {t('common.storePlugin.all')}
              </div>

              {classifyList.map((item: Classify) => (
                <div
                  key={item.id}
                  className="px-4 py-1.5 rounded-lg cursor-pointer text-sm flex items-center justify-center font-medium h-[32px]"
                  style={{
                    background: [hoverClassify, classify].includes(item.id)
                      ? '#FFFFFF'
                      : '',
                    color: [hoverClassify, classify].includes(item.id)
                      ? '#275EFF'
                      : '#757575',
                  }}
                  onMouseEnter={() => setHoverClassify(item.id)}
                  onMouseLeave={() => setHoverClassify('')}
                  onClick={() => {
                    setTagFlag('');
                    setClassify(item.id);
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Select
              suffixIcon={<img src={formSelect} className="w-4 h-4" />}
              className="search-select detail-select"
              value={searchValue.orderFlag}
              style={{ borderRadius: '8px' }}
              onChange={value => {
                setSearchValue(() => ({
                  ...searchValue,
                  orderFlag: value,
                }));
                getTools(content, value);
              }}
              options={[
                { label: t('common.storePlugin.mostPopular'), value: 0 },
                { label: t('common.storePlugin.recentlyUsed'), value: 1 },
              ]}
            ></Select>
            <div className="relative ml-6 search-input-rounded">
              <RetractableInput
                restrictFirstChar={true}
                onChange={getToolsDebounce}
                value={content}
              />
            </div>
          </div>
        </div>
      </div>
      {/* 2.卡片样式 */}
      {tools?.length > 0 && (
        <div
          className="flex items-start justify-center flex-1 w-full mt-6 overflow-auto"
          ref={toolRef}
          onScroll={handleScroll}
        >
          <div className="w-full grid lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3 gap-5 max-w-[1425px] px-6">
            {tools?.map((tool: Tool) => (
              <div
                className="Store-knowledge-card-item group"
                onClick={() => {
                  navigate(
                    `/store/plugin/${tool.id || tool?.mcpTooId}?isMcp=${tool?.isMcp}&searchInput=${encodeURIComponent(content)}&category=${searchValue.orderFlag}&tab=${classify}`
                  );
                }}
              >
                <div className="flex">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 mt-[3px] mr-4">
                    <img src={tool.icon} className="w-12 h-12 rounded" alt="" />
                  </div>
                  <div className="flex-1">
                    <div className="flex display-row ">
                      <div
                        className="w-full text-overflow title-color title-size font-semibold text-[20px]"
                        title={tool?.name}
                      >
                        {tool?.name?.length > 12
                          ? `${tool?.name?.slice(0, 12)}...`
                          : tool?.name}
                      </div>
                      {/* <div
                        className="flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          handleToolFavorite(tool);
                        }}
                      >
                        <img
                          src={tool?.isFavorite ? checkCollect : collect}
                          className="w-4 h-4"
                          alt=""
                        />
                      </div> */}
                    </div>
                    <div
                      className="mt-2 text-desc text-[14px] text-overflow-more text-overflow-1 h-5 tracking-wider"
                      title={tool.description}
                    >
                      {tool.description.length > 18
                        ? `${tool.description.slice(0, 18)}...`
                        : tool.description}
                    </div>
                    <div className="h-[28px] mt-3 ">
                      {tool.tags && tool.tags.length > 0 && (
                        <div className="flex items-center">
                          {tool.tags
                            .slice(0, 3)
                            .map((tag: string, index: number) => (
                              <div
                                key={index}
                                className="mr-2 text-[14px] px-2 py-1 rounded flex items-center justify-center text-[#333333] fit-content h-[28px]"
                                style={{
                                  backgroundColor: 'rgba(223, 229, 255, 0.6)',
                                }}
                              >
                                {tag}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-[12px] mt-3 text-[#7F7F7F]">
                      <div className="flex pr-6">
                        <div className="flex items-center pr-2">
                          <img
                            src={toolAuthor}
                            className="w-[14px] h-[14px]"
                            alt=""
                          />
                        </div>
                        <div>
                          {t('common.storePlugin.xingchenAgentOfficial')}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex items-center pr-2">
                          <img
                            src={headLogo}
                            className="w-[14px] h-[14px]"
                            alt=""
                          />
                        </div>
                        <div>
                          {tool.heatValue >= 10000
                            ? `${(tool.heatValue / 10000).toFixed(1)}万`
                            : tool.heatValue}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {loading && <Spin className="mt-2" size="large" />}

      {!loading && tools?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2">
          <img src={defaultPng} className="w-[140px] h-[140px]" alt="" />
          <div>{t('common.storePlugin.noPlugins')}</div>
        </div>
      )}
    </div>
  );
}

export default memo(PluginStore);
