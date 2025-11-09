import {
  useState,
  useEffect,
  useRef,
  memo,
  useContext,
  useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import { message } from 'antd';
import localforage from 'localforage';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Base64 } from 'js-base64';
import { useSparkCommonStore } from '@/store/spark-store/spark-common';
import { useLocaleStore } from '@/store/spark-store/locale-store';
import {
  transformMultiModal,
  getQueryString,
  getBase64DecodeStr,
  transformMathThinkData,
  transformDeepthinkData,
} from '@/utils/spark-utils';
import { handleOtherProps } from '@/utils/chat';
import eventBus from '@/utils/event-bus';
import { getLanguageCode } from '@/utils/http';
// import CodeWin from '@/components/code-win';
import { installPlugin } from '@/services/plugin';
import { DeleteIcon } from '@/components/svg-icons';
import { PluginContext } from '@/components/plugin/PluginContext';
import { localeConfig } from '@/locales/localeConfig';
// import MultiModeModal from '../muti-modal-components/multiModeModal';
// import MultiModeCpn from '../muti-modal-components/multi_mode_cpn';
// import $ from 'jquery';
// import ViewBigimg from 'view-bigimg';
// import MathThinkProgress from '../MathThinkProgress';
// import DeepThinkProgress from '../DeepThinkProgress';
import { useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';

import userImg from '@/assets/svgs/user-logo.svg';
import errorIcon from '@/assets/imgs/sparkImg/errorIcon.svg';

import styles from './index.module.scss';

let captchaObj: any;

// const viewer = new ViewBigimg();
const bug = getQueryString('bug');

const PromptTry = ({
  setQuestionTip,
  item,
  promptList,
  index,
  setPromptList,
  promptAnswerCompleted,
  newModel,
  showModelPk,
  showTipPk,
  questionTip,
  newPrompt,
  baseinfo,
  inputExample,
  coverUrl,
  selectSource,
  prompt,
  model,
  supportContext,
  promptText,
  choosedAlltool,
}: {
  setQuestionTip?;
  item?;
  promptList?;
  index?;
  setPromptList?;
  promptAnswerCompleted?;
  newModel?;
  showModelPk?;
  showTipPk?;
  questionTip?;
  newPrompt?;
  baseinfo?;
  inputExample?;
  coverUrl?: any;
  selectSource?: any;
  prompt?: any;
  model?: any;
  supportContext?: number;
  promptText?: string;
  choosedAlltool?: any;
}) => {
  const { t } = useTranslation();
  const [deepThinkPeriod, setDeepThinkPeriod, getDeepThinkPeriod] =
    useGetState<any>([]);

  const [openCurrentMath, setOpenCurrentMath] = useState(false); // 是否打开当前解题（生成中的）
  const [processVisible, setProcessVisible] = useState(false); // 解题过程显示
  const [currentMathThink, setCurrentMathThink] = useState<any>({
    current_title: '',
    text: '',
    thinking_cost: 0,
  }); // sse实时返回时，数学解题思路的内容
  const [promptTextNow, setPromptTextNow] = useState(promptText);

  const userAvatar = useSparkCommonStore(state => state.avatar);
  const botMode = useSparkCommonStore(state => state.isBotMode); // 是否智能体模式
  const answerLoading = useSparkCommonStore(state => state.answerLoad);
  const setAnswerLoading = useSparkCommonStore(state => state.setAnswerLoad);
  const answerCompleted = useSparkCommonStore(state => state.answerCompleted);
  const setAnswerCompleted = useSparkCommonStore(
    state => state.setAnswerCompleted
  );
  const { locale: localeNow } = useLocaleStore();

  const location = useLocation();
  const isPlugin = location?.pathname?.startsWith('/plugin');

  /* state */
  const [answer, setAnswer]: any = useState('');
  const [error, setError]: any = useState('');
  const [mergedList, setMergedList]: any = useState([]); // 对话列表
  const {
    data: { infoId, flag, status },
  } = useContext(PluginContext);
  const [multiModeModalInfo, setMultiModeModalInfo] = useState<any>({
    open: false,
    info: { type: 'vm-live-modal', modalInfo: {} },
  }); // 多模态弹窗信息

  /* ref */
  const $answerRef: any = useRef(null);
  const controllerRef: any = useRef(null);
  const gtObj = useRef<any>({
    url: '',
    form: null,
    oldList: null,
    token: '',
  }); // 极验对象信息
  const tempSid = useRef(0); // 假sid
  const $bottomRef: any = useRef(null); // 页面底部不可见元素
  const $ask: any = useRef(null);
  const $inputConfirmFlag: any = useRef(true); // 是否完成输入
  const $godownFlag: any = useRef(false); // 持续下拉flag
  const $temRandom: any = useRef(''); // 时间戳随机数

  const removeAll = () => {
    setMergedList([]);
    setProcessVisible(false);
    setCurrentMathThink({
      current_title: '',
      text: '',
      thinking_cost: 0,
    });
    setDeepThinkPeriod([]);
    setError('');
  };

  const enterFn = e => {
    // ctrl+enter执行换行
    if (e.ctrlKey && e.code === 'Enter') {
      e.cancelBubble = true; //ie阻止冒泡行为
      e.stopPropagation(); //Firefox阻止冒泡行为
      e.preventDefault(); //取消事件的默认动作*换行
      $ask.current.value += `\n`;
      return;
    }
    if (
      !e.shiftKey &&
      !e.ctrlKey &&
      e.code === 'Enter' &&
      $inputConfirmFlag.current
    ) {
      e.cancelBubble = true; //ie阻止冒泡行为
      e.stopPropagation(); //Firefox阻止冒泡行为
      e.preventDefault(); //取消事件的默认动作*换行
      handleSendBtnClick();
      return;
    }
  };

  useEffect(() => {
    eventBus.on('handleSendBtn', handleSendBtnClick);

    return () => {
      eventBus.off('handleSendBtn', handleSendBtnClick);
    };
  }, []);

  useEffect(() => {
    eventBus.on('eventRemoveAll', removeAll);

    return () => {
      eventBus.off('eventRemoveAll', removeAll);
    };
  }, []);

  useEffect(() => {
    eventBus.on('evenEnterFn', e => enterFn(e));
    return () => {
      eventBus.off('eventEnterFn', enterFn);
    };
  }, []);

  useEffect(() => {
    if (questionTip) {
      handleSendBtnClick();
    }
  }, [questionTip]);

  useEffect(() => {
    const d = document.querySelector('#watermark-wrapper');
    if (d) {
      const child: any = d.firstChild;
      if (child) {
        child.style.width = '100%';
        child.style.height = '100%';
      }
    }
  }, []);

  useEffect(() => {
    setPromptTextNow(promptText);
  }, [promptText]);

  useEffect(() => {
    setMergedList([]);
    return () => {
      setMergedList([]);
      stopAnswer();
    };
  }, [flag, status, item]);

  // plugin: 用户获取插件的访问令牌
  const installPluginFn = async () => {
    try {
      await localforage.setItem('infoId', String(infoId));
      const _url = await installPlugin(infoId as number, '/plugin/create');
      if (_url) {
        message.warning(
          t('configBase.promptModel.pluginNeedsUserAuthorization'),
          0.5,
          () => {
            window.location.href = _url;
          }
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  // 当一页回答太长，从无滚动条到有滚动条时，滚动一次到最底端
  const onAnswerLoadingGoDown = () => {
    if (!$godownFlag.current) return;
    const outWrap = document.getElementById('out-wrap');
    const d = document.getElementById('chat-content-wrapper');
    if (
      d &&
      outWrap &&
      $godownFlag.current &&
      d?.clientHeight > outWrap?.clientHeight
    ) {
      outWrap.scrollTop = d?.clientHeight;
      $godownFlag.current = false;
    }
  };

  const scrollDialogToBottom = () => {
    setTimeout(() => {
      $bottomRef && $bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  // 点击发送按钮
  const handleSendBtnClick = () => {
    setCurrentMathThink({
      current_title: '',
      text: '',
      thinking_cost: 0,
    });

    if (!answerCompleted) {
      message.warning(t('configBase.promptModel.answerPleaseTryAgainLater'));
      return;
    }

    const question: string = $ask.current?.value;
    if (!questionTip) {
      if (!question || question.trim() === '') {
        message.info(t('configBase.promptModel.pleaseEnterQuestion'));
        return;
      }
      $ask.current.value = '';
    }

    newQuestion(questionTip ? questionTip : question, mergedList);
  };

  // mergedList中新增一个问题, 并且调接口获取答案
  const newQuestion = (str: string, originMergedList: any, newchatId?: any) => {
    const list = [...originMergedList];
    list.unshift({
      message: str,
      origin: 'req',
      id: `${tempSid.current}`,
    });
    tempSid.current += 1;
    setMergedList(list);
    scrollDialogToBottom();
    // 调用提问接口
    getAnswer(list, str);
  };

  // 将回答推入mergedList
  const newResp = async (
    str: string,
    sid: string,
    originMergedList: any,
    multiModalData?: any,
    type?: any,
    otherProps?: any, // 接下来往newResp内传参，请向otherProps内扩展
    content?: any
  ) => {
    const { reasoning, reasoningElapsedSecs } = otherProps ?? {};
    const list = [...originMergedList];
    const tempItem: any = {
      message: str,
      origin: 'resp',
      sid,
      reasoning,
      reasoningElapsedSecs,
      content: JSON.stringify(content),
      uuid: originMergedList?.length,
    };
    // 此处插入实时获取的多媒体数据
    switch (multiModalData?.type) {
      case 'multi_video': // 直播的虚拟人视频
        tempItem.url = multiModalData.data;
        tempItem.type = 'multi_video';
        tempItem.message = `\`\`\`multi_video\n${JSON.stringify(
          multiModalData.data
        )}\n\`\`\``;
        break;
      case 'multi_image_url':
        tempItem.url = multiModalData.data;
        tempItem.type = 'multi_image_url';
        break;
      default:
        break;
    }
    list.unshift(tempItem);
    setMergedList(list);
    scrollDialogToBottom();
    if (type === 'o1') {
      setOpenCurrentMath(val => {
        tempItem.mathProcessOpen = val;
        return val;
      });
    }
    if (getDeepThinkPeriod()?.length > 0) {
      tempItem.thinkPeriods = getDeepThinkPeriod();
    }
    setDeepThinkPeriod([]);
  };

  // 获取答案
  const getAnswer = (originMergedList: any, question: any, newchatId?: any) => {
    const w: any = window;
    const esURL = isPlugin
      ? '/xingchen-api/u/chat_message/plugin-debug'
      : '/xingchen-api/u/chat_message/bot-debug';
    const form = new FormData();
    if (model) {
      form.append('model', newModel ? newModel : model);
    } else {
      form.append('model', newModel ? newModel : 'spark');
    }

    form.append('text', question);
    if (!isPlugin) {
      const datasetList: string[] = [];
      (selectSource || []).forEach((item: any) => {
        datasetList.push(item.id);
      });
      if (datasetList.join(',') !== '') {
        if (selectSource[0]?.tag == 'SparkDesk-RAG') {
          form.append('datasetList', JSON.stringify(datasetList.join(',')));
        } else {
          form.append('maasDatasetList', JSON.stringify(datasetList.join(',')));
        }
      }
    }
    if (isPlugin && infoId) {
      form.append('infoId', String(infoId));
    } else {
      const time = String(+new Date());
      const fd = time.substring(time.length - 6);
      $temRandom.current = fd;
      form.append('need', `${supportContext}`);
      const arr = mergedList?.reverse()?.map((item: any) => item.message);
      if (supportContext === 1) form.append('arr', arr ?? []);
    }
    if (choosedAlltool) {
      form.append(
        'openedTool',
        Object.keys(choosedAlltool)
          .filter((key: any) => choosedAlltool[key])
          .join(',')
      );
    }
    setAnswerLoading(true);
    setAnswerCompleted(false);
    fetchEs(esURL, form, originMergedList, '');
  };

  // 调用sse接口
  const fetchEs = (
    url: string,
    form: any,
    originMergedList: any[],
    token: string,
    validateResult?: any
  ) => {
    setAnswerLoading(true);
    setAnswerCompleted(false);
    item.promptAnswerCompleted = false;
    $godownFlag.current = true;
    let ans = '';
    setAnswer(ans);
    setError('');
    let otherProps: any = {};
    let ansType: any = null;
    let ansContent: any = null;
    let err = '';
    let answerAllGet = false;
    let sid = '';
    let multiModalData: any = null;
    const controller = new AbortController();
    controllerRef.current = controller;
    const headerConfig: any = {
      Challenge: validateResult?.geetest_challenge,
      Seccode: Base64.encode(validateResult?.geetest_seccode || ''),
      Validate: validateResult?.geetest_validate,
    };
    if (!isPlugin) {
      headerConfig.clientType = '11';
    }
    form.append('GtToken', token);
    form.append(
      'prompt',
      newPrompt ? newPrompt : prompt //TODO 用promptRef
    );

    scrollDialogToBottom();
    fetchEventSource(url, {
      method: 'POST',
      body: form,
      headers: {
        ...headerConfig,
        'Accept-Language': getLanguageCode(),
      },
      openWhenHidden: true,
      signal: controller.signal,
      onopen(res: any) {
        if (res.status === 401) {
          // jumpToLogin();
        }
        setAnswerLoading(false);
        scrollDialogToBottom();
        return Promise.resolve();
      },
      onmessage(event) {
        const deCodedData = getBase64DecodeStr(event.data);
        onAnswerLoadingGoDown();
        // 未出错，正常结束
        if (event.data === '<end>' && !err) {
          setAnswerCompleted(true);
          setQuestionTip('');
          item.promptAnswerCompleted = true;
          $godownFlag.current = false;
          $answerRef.current = '';
          answerAllGet = true;
          return;
        }
        // 出错了、禁用对话
        else if (event.data === '<end>' && err) {
          const errData = JSON.parse(err.replace(/^\[.*?\]/, ''));
          setError(errData?.descr);
          setAnswerCompleted(true);
          setQuestionTip('');
          item.promptAnswerCompleted = true;
          $godownFlag.current = false;
          $answerRef.current = '';
          newResp(errData?.descr, `${tempSid.current}`, originMergedList);
          setError('');
          tempSid.current += 1;
          if (errData?.key === 20002) {
            window.onbeforeunload = null;
          }
          controller.abort(t('configBase.promptModel.end'));
          return;
        }
        // 出错请求头
        if (event.data === '[error]') {
          err += event.data;
          return;
        }

        if (event.data === '[belongerr]') {
          // chatid 不属于 当前账号, 这次chat接口只会返回这个头
          window.location.reload();
        }
        // 识别到就封
        if (event.data === '<kx>') {
          console.log('触发了快修');
          return;
        }
        if (event.data.startsWith('[needAuthError]')) {
          installPluginFn();
          err += event.data;
          console.log('插件没权限');
          return;
        }
        // 模型返回溯源结果
        if (
          !event.data?.endsWith('<sid>') &&
          deCodedData?.startsWith('```searchSource')
        ) {
          return;
        }
        if (
          !event.data?.endsWith('<sid>') &&
          (deCodedData?.startsWith('<math_thinking') ||
            deCodedData?.startsWith('<thinking'))
        ) {
          ansContent = transformMathThinkData(deCodedData, ansContent);
          ansType = 'o1';
          setProcessVisible(visible => {
            setOpenCurrentMath(visible);
            return visible;
          });
          setCurrentMathThink({ ...ansContent });
          return;
        }
        if (
          !event.data?.endsWith('<sid>') &&
          deCodedData?.startsWith('<deep_x1>')
        ) {
          setDeepThinkPeriod(
            transformDeepthinkData(
              { setV2Trace: () => null },
              deCodedData,
              deepThinkPeriod
            )
          );
          return;
        }
        if (event.data.startsWith('[pluginError]')) {
          err += event.data;
          return;
        }
        // 多媒体流程
        if (Base64.decode(event.data)?.startsWith('```multi')) {
          if (!multiModalData)
            multiModalData = transformMultiModal(event.data) || null;
          return;
        }
        // 正常走
        if (!err) {
          if (answerAllGet) {
            sid = event.data.split('<sid>')[0] || '';
            otherProps = handleOtherProps(otherProps, ansContent, ansType);
            newResp(
              ans,
              sid,
              originMergedList,
              multiModalData,
              ansType,
              otherProps,
              ansContent
            );
            controller.abort(t('configBase.promptModel.end'));
            return;
          }
          ans = `${ans}${Base64.decode(event.data)}`;
          setAnswer(ans);
        } else {
          err += event.data;
        }
      },
      onerror(err) {
        console.warn('esError', err);
        setAnswerLoading(false);
        setAnswerCompleted(true);
        setQuestionTip('');
        item.promptAnswerCompleted = true;
        $godownFlag.current = false;
        setAnswer('');
        console.error(err);
        setError('网络好像出了个小差，可以刷新页面试一下。');
        throw err;
      },
    }).catch(() => {
      // stopAnswer();
    });
  };

  // 停止回答
  const stopAnswer = () => {
    controllerRef.current && controllerRef.current.abort();
    setAnswerCompleted(true);
    setQuestionTip('');
    if (item) {
      item.promptAnswerCompleted = true;
    }

    setAnswerLoading(false);
    $godownFlag.current = false;
    $answerRef.current = '';
    const list = [...mergedList];
    list.unshift({
      message: answer,
      origin: 'resp',
      sid: `${tempSid.current}`,
      reasoning: currentMathThink.text,
      reasoningElapsedSecs: currentMathThink.thinking_cost,
      thinkPeriods: deepThinkPeriod,
    });
    tempSid.current += 1;
    setMergedList(list);
    setDeepThinkPeriod([]);
  };

  // 改变多模态弹窗状态
  const changeMultiModeModalInfo = (value: any) => {
    setMultiModeModalInfo(value);
  };

  const handleCodeWinClick = useCallback((event: any) => {
    const srcValue = event.target.getAttribute('src');
    const tagName = event.target.nodeName.toLowerCase();
    if (tagName === 'img' && srcValue && bug === 's') {
      // viewer.show(srcValue);
    }
    const _className = event.target.className;
    if (
      ['pr-icon', 'pr-name', 'pr-contro-icon', 'pr-contro-icon open'].includes(
        _className
      )
    ) {
      const wrapperDom = $(event?.target).closest('.wrapper');
      const target = $(`#${wrapperDom.data('target-id')}`);
      const iconDom = wrapperDom.find('.pr-contro-icon');
      const _display = target.css('display');
      if (_display === 'none') {
        target.fadeIn(100);
        iconDom.addClass('open');
      } else {
        target.fadeOut(100);
        iconDom.removeClass('open');
      }
      const _top = $('#out-wrap').scrollTop() - wrapperDom.position().top;
      $('#out-wrap').animate(
        {
          scrollTop: _top + 100,
        },
        200
      );
    }
  }, []);

  return (
    <div className={styles.prompt_try}>
      <div className={styles.out_wrap} id="out-wrap">
        {isPlugin && !flag ? (
          <div className={styles.placeholder}>
            <img
              src="https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16890797804930887%2Fcode_win.png"
              className={styles.placeholder_pic}
              alt=""
            />
            <div className={styles.pr_title}>
              {status !== 0
                ? t('configBase.promptModel.uploadDescriptionAndApiDocument')
                : t('configBase.promptModel.uploadApiDocumentAndVerify')}
            </div>
            <div className={styles.pr_subtle}>
              {status !== 0
                ? t(
                    'configBase.promptModel.uploadDescriptionAndApiDocumentAndVerify'
                  )
                : t(
                    'configBase.promptModel.uploadApiDocumentAndVerifyAndDebugPreview'
                  )}
            </div>
          </div>
        ) : null}
        <div className={styles.chat_content_wrapper} id="chat-content-wrapper">
          <div ref={$bottomRef} />
          {!item?.promptAnswerCompleted && !answerLoading && (
            <div className={styles.stopBtn}>
              <div className={styles.stopSpan} onClick={stopAnswer}>
                <div>{t('configBase.promptModel.stopOutput')}</div>
              </div>
            </div>
          )}
          {!item?.promptAnswerCompleted && !error && (
            <div className={styles.chat_content} id="answer-box">
              <img
                className={botMode ? styles.avatorImage : styles.user_image}
                src={coverUrl || errorIcon}
                alt=""
              />
              <div
                className={styles.content_gpt}
                style={{
                  padding: answerLoading ? '8px 30px 8px 16px' : '',
                  minWidth: answerLoading ? '0' : '260px',
                }}
              >
                {answerLoading ||
                (model == 'xdeepseekr1' ? !currentMathThink.text : false) ? (
                  <span className={styles.ans_text_tip}>
                    <div className={styles.loading}>
                      <div className={styles.loading_inner} />
                    </div>
                    {t('configBase.promptModel.answerInProgress')}
                  </span>
                ) : (
                  <>
                    {/* <DeepThinkProgress
                      deepThinkInfo={deepThinkPeriod}
                      curAnswer={answer ?? ''}
                    /> */}
                    {/* {currentMathThink?.text?.length >= 0 &&
                    model == 'xdeepseekr1' ? (
                      <MathThinkProgress
                        mathThinkInfo={currentMathThink}
                        curAnswer={answer ?? ''}
                      />
                    ) : null} */}
                    {/* <CodeWin
                      isAnswerComplete={!promptAnswerCompleted}
                      mdText={answer ?? ''}
                    /> */}
                  </>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className={styles.chat_content}>
              <img
                className={botMode ? styles.avatorImage : styles.user_image}
                src={coverUrl || errorIcon}
                alt=""
              />
              <div className={styles.content_gpt}>
                <span>{error}</span>
              </div>
            </div>
          )}

          {mergedList.map((item: any, index: any) => {
            if (!item) return null;
            else
              return (
                <div
                  className={styles.chat_content}
                  key={`${item?.sid || 'si'}-${item?.id || 'i'}${item?.uuid} `}
                >
                  <img
                    className={
                      item?.origin === 'req' && userAvatar
                        ? styles.avatorImage
                        : styles.user_image
                    }
                    src={
                      item?.origin === 'req'
                        ? userAvatar || userImg
                        : coverUrl || errorIcon
                    }
                    alt=""
                  />
                  {item?.origin === 'req' ? (
                    <div className={styles.content_user}>{item?.message}</div>
                  ) : (
                    <div className={styles.content_gpt}>
                      {/* <DeepThinkProgress answerItem={item} />
                      <MathThinkProgress answerItem={item} /> */}
                      {![
                        'video',
                        'multi_video',
                        'multi_image_url',
                        'multi_video_edited',
                      ].includes(item.type) && (
                        <>
                          {/* <CodeWin
                            onClick={handleCodeWinClick}
                            currentIndex={index}
                            isAnswerComplete={!promptAnswerCompleted}
                            mdText={item?.message || ''}
                          /> */}
                        </>
                      )}
                      {/* {item.type && (
                        <MultiModeCpn
                          answerObj={item}
                          changeMultiModeModalInfo={changeMultiModeModalInfo}
                          ask={mergedList[index + 1]?.message}
                          getBotList={() => {
                            return;
                          }}
                          bigImgShow={(url: any) => {
                            // viewer.show(url);
                          }}
                        />
                      )} */}
                    </div>
                  )}
                </div>
              );
          })}

          <div className={styles.chat_content}>
            <div className={`${styles.content_gpt} ${styles.default}`}>
              <div className={styles.first}>
                <div className={styles.avatar}>
                  <img src={coverUrl || errorIcon} />
                </div>
                <div className={styles.descBox}>
                  <div className={styles.nameBox}>
                    <h2 className={styles.name}>
                      {baseinfo?.botName ||
                        t('configBase.promptModel.hereIsTheAgentName')}
                    </h2>
                  </div>
                  <div className={styles.desc}>
                    {baseinfo?.botDesc ||
                      t('configBase.promptModel.hereIsTheAgentIntroduction')}
                  </div>
                </div>
              </div>
              {inputExample?.some((ex: string) => ex) && (
                <div className={styles.last}>
                  <div className={styles.input_warning}>
                    {inputExample?.map((ex: string) => {
                      return ex ? (
                        <div
                          className={styles.input_item}
                          onClick={() => {
                            setQuestionTip(ex);
                          }}
                        >
                          {ex.length > 15 ? ex.slice(0, 15) + '...' : ex}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {!showTipPk && !showModelPk && (
        <div className={styles.ask_wrapper}>
          {!promptAnswerCompleted && !answerLoading && (
            <div
              className={styles.quit_botmode}
              onClick={() => {
                removeAll();
              }}
            >
              <DeleteIcon
                style={{ pointerEvents: 'none', marginRight: '6px' }}
              />
              {t('configBase.promptModel.clearHistory')}
            </div>
          )}
          <textarea
            ref={$ask}
            placeholder={(localeConfig as any)?.[localeNow]?.contentHere}
            onKeyDown={(e: any) => {
              enterFn(e);
            }}
            onCompositionStart={() => {
              $inputConfirmFlag.current = false;
            }}
            onCompositionEnd={() => {
              $inputConfirmFlag.current = true;
            }}
          />
          <div
            className={styles.send}
            onClick={() => {
              handleSendBtnClick();
            }}
          >
            {t('configBase.promptModel.send')}
          </div>
        </div>
      )}

      {/* 多模态弹窗入口 */}
      {/* {multiModeModalInfo.open ? (
        <MultiModeModal
          type={multiModeModalInfo?.info?.type}
          modalInfo={multiModeModalInfo?.info?.modalInfo}
          changeMultiModeModalInfo={changeMultiModeModalInfo}
          getHistory={() => {
            return;
          }}
        />
      ) : null} */}
    </div>
  );
};

export default memo(PromptTry);
