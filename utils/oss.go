package utils

import (
	"bytes"
	"fmt"
	"os"
	"time"

	"papergraph/config"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
	"go.uber.org/zap"
)

// UploadToOSS 上传文件到阿里云OSS
// 返回OSS路径
func UploadToOSS(fileName string, data []byte) (string, error) {
	config.Logger.Info("开始上传到OSS", zap.String("file_name", fileName))
	endpoint := os.Getenv("OSS_ENDPOINT")
	accessKeyID := os.Getenv("OSS_ACCESS_KEY_ID")
	accessKeySecret := os.Getenv("OSS_ACCESS_KEY_SECRET")
	bucketName := os.Getenv("OSS_BUCKET")
	if endpoint == "" || accessKeyID == "" || accessKeySecret == "" || bucketName == "" {
		config.Logger.Error("OSS配置缺失", zap.String("endpoint", endpoint), zap.String("bucket", bucketName))
		return "", fmt.Errorf("OSS配置缺失")
	}
	client, err := oss.New(endpoint, accessKeyID, accessKeySecret)
	if err != nil {
		config.Logger.Error("OSS客户端初始化失败", zap.Error(err))
		return "", err
	}
	bucket, err := client.Bucket(bucketName)
	if err != nil {
		config.Logger.Error("获取OSS bucket失败", zap.Error(err))
		return "", err
	}
	ossPath := fmt.Sprintf("papers/%d_%s", time.Now().UnixNano(), fileName)
	err = bucket.PutObject(ossPath, bytes.NewReader(data))
	if err != nil {
		config.Logger.Error("OSS上传文件失败", zap.Error(err), zap.String("oss_path", ossPath))
		return "", err
	}
	config.Logger.Info("OSS上传成功", zap.String("oss_path", ossPath))
	return ossPath, nil
}
