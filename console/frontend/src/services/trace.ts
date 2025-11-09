import http from '@/utils/http';
import { message } from 'antd';

// TODO: trans fn use
export async function getTraceList(params: any) {
  try {
    const response: any = await http.get(`/trace/getTrace`, { params });
    if (response?.data.code !== 0) {
      throw new Error(response.data.message || response.data.desc);
    }
    return response.data.data;
  } catch (error: any) {
    message.error(error?.message ?? '获取trace日志失败');
    throw error;
  }
}

export const getTraceCount = async (params: {
  botId: string;
  startTime: string;
  endTime: string;
}) => {
  try {
    const response: any = await http.get(`/trace/count`, { params });

    if (response?.data.code !== 0) {
      throw new Error(response.data.message || response.data.desc);
    }
    return response.data.data;
  } catch (error: any) {
    message.error(error?.message ?? '获取trace日志失败');
    throw error;
  }
};

export const traceDownload = async (
  params: { botId: string; startTime: string; endTime: string },
  options: { signal?: AbortSignal } = {}
) => {
  try {
    const response: any = await http.get(`/trace/download`, {
      params,
      responseType: 'blob',
      signal: options.signal,
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream',
      },
    });

    if (response?.status !== 200) {
      // 若后端以JSON错误返回，此时 response.data 可能是Blob(JSON字符串)。
      throw new Error(
        (response as any)?.data?.message ||
          (response as any)?.data?.desc ||
          '下载失败'
      );
    }
    return response;
  } catch (error: any) {
    // 取消请求不提示错误
    if (error?.code === 'ERR_CANCELED' || error?.message === 'canceled') {
      throw error;
    }
    throw error;
  }
};
