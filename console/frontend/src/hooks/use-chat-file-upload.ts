import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getS3PresignUrl,
  uploadFileBindChat,
  unBindChatFile,
} from '@/services/chat';
import type {
  BotInfoType,
  UploadFileInfo,
  SupportUploadConfig,
} from '@/types/chat';
import { message } from 'antd';

type UseChatFileUploadReturn = {
  fileList: UploadFileInfo[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFileInfo[]>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileSelect: () => void;
  removeFile: (file: UploadFileInfo) => void;
  hasErrorFiles: () => boolean;
};

export default function useChatFileUpload(
  botInfo: BotInfoType
): UseChatFileUploadReturn {
  const [fileList, setFileList] = useState<UploadFileInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploads = useRef<Map<string, XMLHttpRequest>>(new Map());
  const activeBindings = useRef<Map<string, AbortController>>(new Map());

  const generateFileBusinessKey = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  const updateFileStatus = useCallback(
    (
      uid: string,
      fileId: string,
      status: 'pending' | 'uploading' | 'completed' | 'error',
      progress: number,
      fileUrl = '',
      error = ''
    ) => {
      setFileList(prev =>
        prev.map(file =>
          file.uid === uid
            ? { ...file, fileId, status, progress, fileUrl, error }
            : file
        )
      );
    },
    []
  );

  const validateFile = (
    file: File,
    config?: SupportUploadConfig
  ): string | null => {
    if (!config) return null;
    const acceptTypes = (config.accept || '')
      .toLowerCase()
      .split(',')
      .map(type => type.trim())
      .filter(Boolean);

    const fileName = file.name.toLowerCase();
    const isValidType = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }
      return (file.type || '').includes(type);
    });
    if (!isValidType) return `${file.name}是不支持的文件类型`;
    return null;
  };

  // 处理选择的文件
  const processSelectedFiles = (files: File[]) => {
    const limit = botInfo?.supportUploadConfig?.[0]?.limit || 0;
    if (limit > 0 && fileList.length + files.length > limit) {
      message.warning(`最多上传${limit}个文件`);
      return;
    }

    const config = botInfo?.supportUploadConfig?.[0] as
      | SupportUploadConfig
      | undefined;
    const validFiles: File[] = [];
    files.forEach(file => {
      const validationError = validateFile(file, config);
      if (!validationError) validFiles.push(file);
    });

    if (validFiles.length > 0) {
      const newFiles: UploadFileInfo[] = validFiles.map(file => ({
        uid: generateFileBusinessKey(),
        file,
        fileName: file.name,
        fileSize: file.size,
        type: file.type,
        status: 'pending',
        fileUrl: '',
        fileBusinessKey: generateFileBusinessKey(),
        progress: 0,
        error: '',
      }));
      setFileList(prev => [...prev, ...newFiles]);
    }
  };

  const uploadFileToS3 = async (fileObj: UploadFileInfo) => {
    try {
      updateFileStatus(fileObj.uid, '', 'pending', 0, '', '');
      const signedRes = await getS3PresignUrl(fileObj.fileName, fileObj.type);
      const realFileUrl = (signedRes.url.split('?')[0] || '') as string;
      const arrayBuffer = await fileObj.file.arrayBuffer();
      updateFileStatus(fileObj.uid, '', 'uploading', 0, realFileUrl);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        activeUploads.current.set(fileObj.uid, xhr);

        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 95);
            updateFileStatus(
              fileObj.uid,
              '',
              'uploading',
              progress,
              realFileUrl
            );
          }
        });

        xhr.addEventListener('load', async () => {
          activeUploads.current.delete(fileObj.uid);
          if (xhr.status >= 200 && xhr.status < 300) {
            const bindController = new AbortController();
            activeBindings.current.set(fileObj.uid, bindController);
            try {
              const bindResult = await uploadFileBindChat(
                {
                  chatId: botInfo.chatId,
                  fileName: fileObj.fileName,
                  fileSize: fileObj.fileSize,
                  fileUrl: realFileUrl,
                  fileBusinessKey: fileObj.fileBusinessKey,
                },
                bindController.signal
              );
              activeBindings.current.delete(fileObj.uid);
              updateFileStatus(
                fileObj.uid,
                bindResult,
                'completed',
                100,
                realFileUrl
              );
              resolve(true);
            } catch (error: any) {
              activeBindings.current.delete(fileObj.uid);
              if (error?.name === 'AbortError') {
                updateFileStatus(
                  fileObj.uid,
                  '',
                  'error',
                  0,
                  realFileUrl,
                  '绑定已取消'
                );
              } else {
                updateFileStatus(
                  fileObj.uid,
                  '',
                  'error',
                  0,
                  realFileUrl,
                  '绑定失败'
                );
              }
              reject(error);
            }
          } else {
            updateFileStatus(
              fileObj.uid,
              '',
              'error',
              0,
              realFileUrl,
              '上传失败'
            );
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          activeUploads.current.delete(fileObj.uid);
          updateFileStatus(
            fileObj.uid,
            '',
            'error',
            0,
            realFileUrl,
            '网络错误'
          );
          reject(new Error('Network error'));
        });

        xhr.addEventListener('abort', () => {
          activeUploads.current.delete(fileObj.uid);
        });

        xhr.open('PUT', signedRes.url);
        xhr.setRequestHeader(
          'Content-Type',
          fileObj.type || 'application/octet-stream'
        );
        xhr.send(arrayBuffer);
      });
    } catch (error) {
      activeUploads.current.delete(fileObj.uid);
      updateFileStatus(fileObj.uid, '', 'error', 0, '', '获取签名URL失败');
      throw error;
    }
  };

  const handleStartUpload = async (files: UploadFileInfo[]) => {
    const pendingFiles = files.filter(file => file.status === 'pending');
    if (pendingFiles.length === 0) return;
    const uploadPromises = pendingFiles.map(file => uploadFileToS3(file));
    await Promise.allSettled(uploadPromises);
  };

  useEffect(() => {
    void handleStartUpload(fileList);
  }, [fileList.length]);

  const cancelUpload = (uid: string) => {
    const xhr = activeUploads.current.get(uid);
    if (xhr) {
      xhr.abort();
      activeUploads.current.delete(uid);
      setFileList(prev =>
        prev.map(file =>
          file.uid === uid
            ? { ...file, status: 'pending', progress: 0, error: '上传已取消' }
            : file
        )
      );
    }
  };

  const cancelBinding = (uid: string) => {
    const bindController = activeBindings.current.get(uid);
    if (bindController) {
      bindController.abort();
      activeBindings.current.delete(uid);
    }
  };

  const removeFile = (file: UploadFileInfo) => {
    if (file.fileId) {
      // 已绑定，调用解绑
      unBindChatFile({ chatId: botInfo.chatId, fileId: file.fileId });
    } else {
      // 未绑定：取消上传与绑定
      cancelUpload(file.uid);
      cancelBinding(file.uid);
    }
    setFileList(prev => prev.filter(f => f.uid !== file.uid));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    processSelectedFiles(selectedFiles);
    if (event.target) event.target.value = '';
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const hasErrorFiles = (): boolean =>
    fileList.some(file => file.status === 'error');

  return {
    fileList,
    setFileList,
    fileInputRef,
    handleFileSelect,
    triggerFileSelect,
    removeFile,
    hasErrorFiles,
  };
}
