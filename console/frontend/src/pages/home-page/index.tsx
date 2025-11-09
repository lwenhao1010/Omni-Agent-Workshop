/*
 * @Author: snoopyYang
 * @Date: 2025-09-23 10:14:36
 * @LastEditors: snoopyYang
 * @LastEditTime: 2025-09-23 10:14:45
 * @Description: 首页：智能体广场
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCommonConfig } from '@/services/common';
import {
  getAgentType,
  getAgentList,
  collectBot,
  cancelFavorite,
} from '@/services/agent-square';
import styles from './index.module.scss';
import { Input, message, Spin, Tooltip } from 'antd';
import classnames from 'classnames';
import eventBus from '@/utils/event-bus';
import { debounce } from 'lodash';
import useChat from '@/hooks/use-chat';
import useUserStore from '@/store/user-store';
import useHomeStore from '@/store/home-store';
import { getLanguageCode } from '@/utils/http';
import { BotType, Bot, SearchBotParam, Banner } from '@/types/agent-square';
import type { ResponseResultPage } from '@/types/global';
import { handleShare } from '@/utils';

const PAGE_SIZE = 10;

const PAGE_INFO_ORIGIN: SearchBotParam = {
  search: '',
  page: 1,
  pageSize: PAGE_SIZE,
  type: 0,
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const currentLang = getLanguageCode();

  const [bannerList] = useState<Banner[]>([
    // NOTE: isOpen: 是否新开页面跳转
    {
      src: 'https://openres.xfyun.cn/xfyundoc/2025-09-01/ec2409cf-17cc-4276-b8f3-acdca4abac42/1756696685915/agentRewardBanner.png',
      srcEn:
        'https://openres.xfyun.cn/xfyundoc/2025-09-01/ec2409cf-17cc-4276-b8f3-acdca4abac42/1756696685915/agentRewardBanner.png',
      url: `${window.location.origin}/activitySummer`,
      isOpen: false,
    },
    // NOTE: 0728新banner 4张
    {
      src: 'https://openres.xfyun.cn/xfyundoc/2025-07-28/1b4d1b3b-5fc0-44e5-938a-f11cd399ea09/1753666916737/banner01-07.28.jpg',
      srcEn:
        'https://openres.xfyun.cn/xfyundoc/2025-07-29/e6c12f1d-9e5c-4623-b668-d05d2d826a1f/1753771451925/banner-en02.jpg',
      url: `${window.location.origin}/chat?sharekey=e1e62e4027b882aa7a43d4b25ed4974c&botId=2963659`,
      isOpen: false,
    },
    {
      src: 'https://openres.xfyun.cn/xfyundoc/2025-07-28/057e265c-d206-42a0-bcc4-e35d1a5950ad/1753666916740/banner02-07.28.jpg',
      srcEn:
        'https://openres.xfyun.cn/xfyundoc/2025-07-29/453698ff-0f08-41d7-b847-9db6640852c6/1753771451926/banner-en03.jpg',
      url: `${window.location.origin}/chat?sharekey=b17abc6f0d4a356ed09a9fe1631ffd2c&botId=2958065`,
      isOpen: false,
    },
    {
      src: 'https://openres.xfyun.cn/xfyundoc/2025-07-28/d88084c2-16c8-4210-b5cb-7ef3e298a1bb/1753666916741/banner03-07.28.jpg',
      srcEn:
        'https://openres.xfyun.cn/xfyundoc/2025-07-29/0d319c45-816c-4d5b-a94c-91bc489c374d/1753771451926/banner-en04.jpg',
      url: `${window.location.origin}/chat?sharekey=003e4873f478e5f1f9ed82930d0bb4e7&botId=2216831`,
      isOpen: false,
    },
    {
      src: 'https://openres.xfyun.cn/xfyundoc/2025-07-28/79576df5-7d4c-4cf0-b7cf-b1c343acc11a/1753666916742/banner04-07.28.jpg',
      srcEn:
        'https://openres.xfyun.cn/xfyundoc/2025-07-29/4818e1ba-8af5-4374-8238-db7250a14e84/1753771451927/banner-en05.jpg',
      url: `${window.location.origin}/chat?sharekey=9991b23791117619a3c3608a44c1c499&botId=2813049`,
      isOpen: false,
    },
  ]);
  const [botTypes, setBotTypes] = useState<BotType[]>([]);
  const {
    botType,
    botOrigin,
    scrollTop,
    loadingPage,
    searchInputValue,
    setBotType,
    setBotOrigin,
    setScrollTop,
    setLoadingPage,
    setSearchInputValue,
  } = useHomeStore();
  const homeRef = useRef<HTMLDivElement>(null);
  const [pageInfo, setPageInfo] = useState<SearchBotParam>(PAGE_INFO_ORIGIN); // 页面信息
  const [searchLoading, setSearchLoading] = useState<boolean>(false); // 是否正在加载资源
  const [agentList, setAgentList] = useState<Bot[]>([]); // 智能体列表
  const [loading, setLoading] = useState(false); // 加载更多状态
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据
  const onGettingPage = useRef(false);
  const user = useUserStore((state: any) => state.user);
  const { handleToChat } = useChat();
  const [pendingBotTypeChange, setPendingBotTypeChange] = useState<
    number | null
  >(null);

  // 根据语言环境过滤并选择banner图片
  const filteredBanners: Banner[] = bannerList
    .filter((banner: Banner) => currentLang !== 'en' || banner.srcEn)
    .map((banner: Banner) => ({
      ...banner,
      src: currentLang === 'en' ? banner.srcEn : banner.src,
    }));

  // 处理banner点击事件
  const handleBannerClick = (item: Banner): void => {
    if (item.url) {
      if (item.isOpen) {
        window.open(item.url, '_blank');
      } else {
        window.location.href = item.url;
      }
    }
  };

  //获取智能体类型
  const loadAgentTypeList = async (): Promise<void> => {
    const res: BotType[] = await getAgentType();
    setBotTypes(res || []);
    setBotType(res[0]?.typeKey || 0);
    setPageInfo({
      ...pageInfo,
      type: res[0]?.typeKey || 0,
      search: searchInputValue || '',
    });
  };

  // 搜索框前缀图标
  const prefixIcon = (): React.ReactNode => {
    return <img src={require('@/assets/svgs/search.svg')} alt="" />;
  };

  //开始搜索
  const handleStartSearch = (value: string, pageInfo: SearchBotParam) => {
    setBotOrigin('search');
    setSearchLoading(true);
    setAgentList([]);
    setPageInfo({
      ...pageInfo,
      search: value,
      page: 1,
    });
  };
  //切换助手类型
  const handleBotTypeChange = async (type: number): Promise<void> => {
    onGettingPage.current = false;
    setAgentList([]);
    setPageInfo({
      ...pageInfo,
      type,
      search: '',
      page: 1,
    });
    setHasMore(true);
    setSearchLoading(true);
    setSearchInputValue('');
    setBotType(type);
  };

  // 滚动时获取新列表
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e): void => {
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    // 滚动到距离底部100px时触发
    debouncedSetScrollTop(scrollTop); // 使用防抖的滚动位置更新
    if (
      scrollHeight - scrollTop - clientHeight < 100 &&
      !loading &&
      hasMore &&
      !onGettingPage.current &&
      // botOrigin !== 'home' &&
      !searchLoading
    ) {
      onGettingPage.current = true;
      loadMore()
        .then(() => {
          setLoadingPage(loadingPage + 1);
        })
        .catch(err => {
          console.error('加载更多失败:', err);
        });
    }
  };

  /**
   * 加载更多智能体列表数据
   * @param customPageIndex 自定义页码
   * @returns
   */
  const loadMore = (customPageIndex?: number): Promise<void> => {
    return new Promise(resolve => {
      setLoading(true);
      const currentPageIndex = customPageIndex || pageInfo.page + 1;
      const newPageInfo = {
        ...pageInfo,
        page: currentPageIndex,
      };
      setPageInfo(newPageInfo);
      resolve(void 0);
    });
  };
  /**
   * 加载所有智能体列表
   */
  const loadAgentListAll = (): void => {
    getAgentList({ ...pageInfo })
      .then((res: ResponseResultPage<Bot>) => {
        setAgentList(prevList => {
          const newList = [...prevList, ...res.pageData];
          setHasMore(res.totalCount > newList.length);
          return newList;
        });
        setSearchLoading(false);
      })
      .catch(err => {
        setSearchLoading(false);
        message.error(err?.msg || '网络出小差了，请稍后再试~');
      })
      .finally(() => {
        setLoading(false);
        onGettingPage.current = false;
      });
  };

  /**
   * 取消或者收藏智能体
   * @param item
   * @param e
   */
  const handleCollect = (
    item: Bot,
    e: React.MouseEvent<HTMLDivElement>
  ): void => {
    e.stopPropagation();
    if (!item?.isFavorite) {
      collectBot({
        botId: item.botId,
      })
        .then(() => {
          message.success(t('home.collectionSuccess'));
          eventBus.emit('getFavoriteBotList');
          setAgentList((agents: Bot[]) => {
            const currentBot: Bot | undefined =
              agents.find((t: Bot) => t.botId === item.botId) || ({} as Bot);
            currentBot.isFavorite = true;
            return [...agents];
          });
        })
        .catch(err => {
          message.error(err?.msg || '网络出小差了，请稍后再试~');
        });
    } else {
      cancelFavorite({
        botId: item.botId,
      })
        .then(() => {
          message.success(t('home.cancelCollectionSuccess'));
          eventBus.emit('getFavoriteBotList');
          setAgentList((agents: Bot[]) => {
            const currentBot: Bot | undefined =
              agents.find((t: Bot) => t.botId === item.botId) || ({} as Bot);
            currentBot.isFavorite = false;
            return [...agents];
          });
        })
        .catch(err => {
          message.error(err?.msg || '网络出小差了，请稍后再试~');
        });
    }
  };
  /**
   * 跳转到智能体详情页开始对话
   * @param item
   */
  const handleNavigateToChat = (botId: number): void => {
    handleToChat(botId);
  };

  useEffect(() => {
    const params = {
      category: 'DOCUMENT_LINK',
      code: 'SparkBotHelpDoc',
    };
    if (user?.login || user?.uid) {
      getCommonConfig(params);
    }
    loadAgentTypeList();
  }, []);

  const handleSearch = useCallback(
    debounce((value, pageInfo) => {
      handleStartSearch(value, pageInfo);
    }, 500), // 500ms延迟
    [handleBotTypeChange, handleStartSearch]
  );
  const debouncedSearchRef = useRef(handleSearch);

  // 创建防抖的滚动位置更新函数
  const debouncedSetScrollTop = useCallback(
    debounce((scrollTop: number) => {
      setScrollTop(scrollTop);
    }, 100),
    [setScrollTop]
  );

  // 监听scrollTop变化，如果有待处理的botType变更，则执行
  useEffect(() => {
    if (pendingBotTypeChange !== null && scrollTop === 0) {
      handleBotTypeChange(pendingBotTypeChange);
      setPendingBotTypeChange(null);
    }
  }, [scrollTop, pendingBotTypeChange]);

  const handleValueChange = (e: any) => {
    const value = e.target.value;
    setSearchInputValue(value);
    debouncedSearchRef.current(value, pageInfo);
  };

  //分享智能体
  const handleShareAgent = async (botInfo: Bot): Promise<void> => {
    await handleShare(botInfo.botName, botInfo.botId, t);
  };

  // 渲染助手列表
  const renderCardWrapper = () => {
    return (
      <div className={styles.card_wrapper}>
        {searchLoading ? (
          <div className={styles.loading_wrapper}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {agentList?.length > 0 ? (
              <div className={styles.recent_card_wrapper}>
                <div
                  className={classnames(
                    styles.recent_card_list,
                    styles.recent_recent
                  )}
                >
                  {agentList.map((item: Bot, index: number) => (
                    <div
                      className={styles.recent_card_item}
                      key={index}
                      onClick={() => handleNavigateToChat(item.botId)}
                    >
                      <img
                        src={item?.botCoverUrl}
                        alt=""
                        className={styles.bot_avatar}
                      />
                      <div className={styles.info}>
                        <div className={styles.title}>
                          <Tooltip
                            placement="bottomLeft"
                            title={item?.botName}
                            arrow={false}
                            overlayClassName="black-tooltip"
                          >
                            <span>{item?.botName}</span>
                          </Tooltip>
                          <div onClick={e => e.stopPropagation()}>
                            <div onClick={() => handleShareAgent(item)} />
                            <div
                              className={classnames({
                                [styles.collect as string]: !!item?.isFavorite,
                              })}
                              onClick={e => {
                                handleCollect(item, e);
                              }}
                            />
                          </div>
                        </div>
                        <Tooltip
                          placement="bottomLeft"
                          title={item?.botDesc}
                          arrow={false}
                          overlayClassName="black-tooltip"
                        >
                          <div className={styles.desc}>{item?.botDesc}</div>
                        </Tooltip>
                        <div className={styles.tags}>
                          {[1, 5].includes(item?.version as number) && (
                            <div className={styles.itag}>
                              {t('home.instructionType')}
                            </div>
                          )}
                          {[2, 3, 4].includes(item?.version as number) && (
                            <div className={styles.itag}>
                              {t('home.workflowType')}
                            </div>
                          )}
                        </div>
                        <div className={styles.author}>
                          <img
                            src={require('@/assets/svgs/author.svg')}
                            alt=""
                          />
                          <span>{item?.creator || '@讯飞星火'}</span>
                          {/* <img src={require('@/assets/svgs/fire.svg')} alt="" />
                          <span>{item?.hotNum}</span> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.good_card_list}>
                <div className={styles.empty_state}>
                  <img
                    src={
                      'https://openres.xfyun.cn/xfyundoc/2024-01-03/2e6bdf58-f307-4765-9dfa-157813ea5875/1704248820240/%E7%BB%841%402x.png'
                    }
                    alt=""
                  />
                  <span
                    onClick={() => {
                      eventBus.emit('createBot');
                    }}
                  >
                    {t('home.noRelatedSearchResults')}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  useEffect(() => {
    pageInfo.type && loadAgentListAll();
  }, [pageInfo]);

  return (
    <div className={styles.home} onScroll={handleScroll} ref={homeRef}>
      <div className={styles.all_agent}>
        {/* 助手类型 */}
        <div className={styles.all_agent_title}>
          <div className={styles.all_agent_title_left}>
            {/* NOTE: 这里的 友伴 需要翻译吗 */}
            {botTypes
              ?.filter?.(item => item.typeName !== '友伴')
              .map((item: BotType) => (
                <div
                  key={item.typeKey}
                  className={classnames(styles.bot_type_item, 'relative', {
                    [styles.activeTab as string]: botType === item.typeKey,
                  })}
                  onClick={() => {
                    handleBotTypeChange(item.typeKey);
                    // 记录发现频道已点击
                    if (item.typeName === '发现') {
                      localStorage.setItem('discoveryClicked', 'true');
                    }
                  }}
                >
                  {item.typeName}
                  {/* 发现频道小红点 */}
                  {item.typeName === '发现' &&
                    !localStorage.getItem('discoveryClicked') &&
                    new Date() < new Date(2025, 7, 24) && (
                      <span className="absolute top-[4px] right-[2px] w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                </div>
              ))}
          </div>
          <div className={styles.all_agent_title_right}>
            <Input
              placeholder={t('home.searchPlaceholder')}
              value={searchInputValue}
              onChange={e => {
                handleValueChange(e);
              }}
              prefix={prefixIcon()}
            />
          </div>
        </div>
        {/* 助手列表 */}
        {renderCardWrapper()}
      </div>
    </div>
  );
};

export default HomePage;
