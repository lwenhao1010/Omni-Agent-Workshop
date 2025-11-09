import { UploadFileInfo } from '@/types/chat';
import { ReactElement } from 'react';
import { Modal, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { getFileIcon } from '@/utils';
import closeIcon from '@/assets/imgs/chat/plugin/delete-file.png';

const FilePreview = ({
  file,
  onClose,
}: {
  file: UploadFileInfo;
  onClose: () => void;
}): ReactElement => {
  // 根据文件类型渲染预览内容
  const renderFilePreview = () => {
    const fileType = file.type?.split('/')[0] || '';
    const extension = file.fileName?.split('.').pop()?.toLowerCase();

    switch (fileType || extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <div className="flex justify-center">
            <img
              src={file.fileUrl}
              alt={file.fileName}
              className="max-h-[60vh] max-w-full object-contain rounded-lg"
            />
          </div>
        );
      case 'pdf':
        return (
          <iframe
            src={file.fileUrl}
            className="w-full h-[60vh] rounded-lg border"
            title={file.fileName}
          />
        );
      case 'audio':
      case 'mp3':
      case 'wav':
        return (
          <div className="flex justify-center">
            <audio controls className="w-full max-w-md">
              <source src={file.fileUrl} type={file.type} />
            </audio>
          </div>
        );
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx':
      default:
        return (
          <div className="flex flex-col items-center justify-center p-4">
            <img src={getFileIcon(file)} alt="" className="w-16 h-16 mb-4" />
            <p className="text-gray-700">
              {['doc', 'docx'].includes(extension || '')
                ? 'Word document preview not supported. Download to view.'
                : ['xls', 'xlsx'].includes(extension || '')
                  ? 'Excel document preview not supported. Download to view.'
                  : 'Preview not available for this file type.'}
            </p>
          </div>
        );
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <img src={getFileIcon(file)} alt="" className="w-6 h-8 mr-2" />
          <span className="truncate max-w-xs">{file.fileName}</span>
        </div>
      }
      open={!!file.fileUrl}
      onCancel={onClose}
      footer={
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => window.open(file.fileUrl, '_blank')}
        >
          Download
        </Button>
      }
      width="50%"
      centered
      closeIcon={<img src={closeIcon} alt="" className="w-4 h-4" />}
      destroyOnClose
    >
      <div
        className="overflow-auto"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {renderFilePreview()}
      </div>
    </Modal>
  );
};

export default FilePreview;
