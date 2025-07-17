package aitools

// 实现阿里千问模型调用

type QwenClient struct {
	ApiKey string
}

func NewQwenClient(apiKey string) *QwenClient {
	return &QwenClient{ApiKey: apiKey}
}
