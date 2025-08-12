package aitools

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"google.golang.org/genai"
)

// 论文分析结构化输出类型
// 与用户需求结构保持一致

type PaperAnalysis struct {
	BasicInfo struct {
		Title           string   `json:"title"`
		Authors         []string `json:"authors"`
		PublicationDate string   `json:"publicationDate"`
		ResearchField   string   `json:"researchField"`
	} `json:"basicInfo"`
	Summary struct {
		Purpose     string `json:"purpose"`
		Methods     string `json:"methods"`
		KeyFindings string `json:"keyFindings"`
		Conclusion  string `json:"conclusion"`
	} `json:"summary"`
	ContentQuality struct {
		ResearchQuestionImportance struct {
			AddressesValuableQuestion      string `json:"addressesValuableQuestion"`
			SignificanceInTheoryOrPractice string `json:"significanceInTheoryOrPractice"`
			Rating                         int    `json:"rating"`
		} `json:"researchQuestionImportance"`
		Innovation struct {
			NewIdeasMethodsModels       string `json:"newIdeasMethodsModels"`
			BreakthroughsOrImprovements string `json:"breakthroughsOrImprovements"`
			Rating                      int    `json:"rating"`
		} `json:"innovation"`
		MethodologyRigor struct {
			ExperimentalDesignReasonable               string `json:"experimentalDesignReasonable"`
			DataSourcesReliableAndSampleSizeSufficient string `json:"dataSourcesReliableAndSampleSizeSufficient"`
			ControlVariablesAndStatisticsConsidered    string `json:"controlVariablesAndStatisticsConsidered"`
			Rating                                     int    `json:"rating"`
		} `json:"methodologyRigor"`
		ResultsValidityReproducibility struct {
			ResultsClearAndCredible        string `json:"resultsClearAndCredible"`
			DetailsForReproductionProvided string `json:"detailsForReproductionProvided"`
			Rating                         int    `json:"rating"`
		} `json:"resultsValidityReproducibility"`
		DataAnalysisDepthBreadth struct {
			DataMiningConducted                   string `json:"dataMiningConducted"`
			StatisticalToolsAndVisualizationsUsed string `json:"statisticalToolsAndVisualizationsUsed"`
			Rating                                int    `json:"rating"`
		} `json:"dataAnalysisDepthBreadth"`
		PracticalApplicationValue struct {
			SolvesRealWorldProblem           string `json:"solvesRealWorldProblem"`
			EngineeringOrCommercialPotential string `json:"engineeringOrCommercialPotential"`
			Rating                           int    `json:"rating"`
		} `json:"practicalApplicationValue"`
		FutureResearchInspiration struct {
			OffersNewInsightsOrDirections     string `json:"offersNewInsightsOrDirections"`
			RaisesOpenQuestionsOrFutureTopics string `json:"raisesOpenQuestionsOrFutureTopics"`
			Rating                            int    `json:"rating"`
		} `json:"futureResearchInspiration"`
	} `json:"contentQuality"`
}

// Gemini多模态分析器
// 支持文本和图片输入

type GeminiClient struct {
	ApiKey string
}

// NewGeminiClient 创建Gemini客户端
func NewGeminiClient(apiKey string) *GeminiClient {
	return &GeminiClient{ApiKey: apiKey}
}

// AnalyzePaper 调用Gemini API分析论文，返回结构化结果
// text: 论文全文或主要内容
// images: 可选图片（如论文图表），可为空
func (g *GeminiClient) AnalyzePaper(ctx context.Context, text string, images [][]byte) (*PaperAnalysis, error) {
	// 设置API Key
	os.Setenv("GEMINI_API_KEY", g.ApiKey)
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return nil, err
	}
	// defer client.Close() // 无Close方法

	// 构造prompt，要求结构化输出
	prompt := `请对以下论文内容进行多维度分析，并以如下JSON结构输出：
` + paperAnalysisJsonSchema + `
论文内容：\n` + text + `\n如有图片信息请结合分析。`

	// 构造内容输入
	input := genai.NewPartFromText(prompt)
	content := &genai.Content{Parts: []*genai.Part{input}}
	// 支持图片可扩展：如有图片可用genai.ImageData

	// 调用Gemini模型
	resp, err := client.Models.GenerateContent(ctx, "gemini-2.5-flash", []*genai.Content{content}, nil)
	if err != nil {
		return nil, err
	}

	// 解析结构化JSON
	var result PaperAnalysis
	if err := json.Unmarshal([]byte(resp.Text()), &result); err != nil {
		return nil, fmt.Errorf("Gemini返回内容解析失败: %w, 原始内容: %s", err, resp.Text())
	}
	return &result, nil
}

// paperAnalysisJsonSchema 用于prompt，指导Gemini输出结构化JSON
const paperAnalysisJsonSchema = `{
  "basicInfo": {
    "title": "",
    "authors": [""],
    "publicationDate": "",
    "researchField": ""
  },
  "summary": {
    "purpose": "",
    "methods": "",
    "keyFindings": "",
    "conclusion": ""
  },
  "contentQuality": {
    "researchQuestionImportance": {
      "addressesValuableQuestion": "",
      "significanceInTheoryOrPractice": "",
      "rating": 3
    },
    "innovation": {
      "newIdeasMethodsModels": "",
      "breakthroughsOrImprovements": "",
      "rating": 3
    },
    "methodologyRigor": {
      "experimentalDesignReasonable": "",
      "dataSourcesReliableAndSampleSizeSufficient": "",
      "controlVariablesAndStatisticsConsidered": "",
      "rating": 3
    },
    "resultsValidityReproducibility": {
      "resultsClearAndCredible": "",
      "detailsForReproductionProvided": "",
      "rating": 3
    },
    "dataAnalysisDepthBreadth": {
      "dataMiningConducted": "",
      "statisticalToolsAndVisualizationsUsed": "",
      "rating": 3
    },
    "practicalApplicationValue": {
      "solvesRealWorldProblem": "",
      "engineeringOrCommercialPotential": "",
      "rating": 3
    },
    "futureResearchInspiration": {
      "offersNewInsightsOrDirections": "",
      "raisesOpenQuestionsOrFutureTopics": "",
      "rating": 3
    }
  }
}`

// UploadProgressCallback 文件上传进度回调类型
// current: 已上传字节数，total: 总字节数
// 返回false可中断上传
type UploadProgressCallback func(current, total int64) bool

// UploadPDFToGemini 上传PDF到Gemini File API，返回file_uri，支持进度回调
func UploadPDFToGemini(ctx context.Context, apiKey, filePath, displayName string, onProgress UploadProgressCallback) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()
	stat, _ := file.Stat()
	total := stat.Size()
	fileBytes := make([]byte, total)
	_, err = file.Read(fileBytes)
	if err != nil {
		return "", err
	}

	// 1. 启动resumable upload
	startURL := fmt.Sprintf("https://generativelanguage.googleapis.com/upload/v1beta/files?key=%s", apiKey)
	req, _ := http.NewRequest("POST", startURL, strings.NewReader(fmt.Sprintf(`{"file": {"display_name": "%s"}}`, displayName)))
	req.Header.Set("X-Goog-Upload-Protocol", "resumable")
	req.Header.Set("X-Goog-Upload-Command", "start")
	req.Header.Set("X-Goog-Upload-Header-Content-Length", fmt.Sprintf("%d", total))
	req.Header.Set("X-Goog-Upload-Header-Content-Type", "application/pdf")
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	uploadURL := resp.Header.Get("X-Goog-Upload-URL")
	if uploadURL == "" {
		return "", fmt.Errorf("未获取到上传URL")
	}

	// 2. 上传文件内容（支持进度回调）
	const chunkSize = 2 * 1024 * 1024 // 2MB分片
	var uploaded int64 = 0
	for uploaded < total {
		remain := total - uploaded
		sz := chunkSize
		if remain < int64(chunkSize) {
			sz = int(remain)
		}
		chunk := fileBytes[uploaded : uploaded+int64(sz)]
		cmd := "upload"
		if uploaded+int64(sz) == total {
			cmd = "upload, finalize"
		}
		req2, _ := http.NewRequest("POST", uploadURL, bytes.NewReader(chunk))
		req2.Header.Set("X-Goog-Upload-Command", cmd)
		req2.Header.Set("X-Goog-Upload-Offset", fmt.Sprintf("%d", uploaded))
		req2.Header.Set("Content-Length", fmt.Sprintf("%d", sz))
		resp2, err := client.Do(req2)
		if err != nil {
			return "", err
		}
		resp2.Body.Close()
		uploaded += int64(sz)
		if onProgress != nil && !onProgress(uploaded, total) {
			return "", fmt.Errorf("用户中断上传")
		}
	}

	// 3. 获取file_uri
	// 最后一次响应体包含file信息
	finalResp, err := client.Get(uploadURL)
	if err != nil {
		return "", err
	}
	defer finalResp.Body.Close()
	body, _ := io.ReadAll(finalResp.Body)
	var result struct {
		File struct {
			URI string `json:"uri"`
		} `json:"file"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("解析file_uri失败: %w, 原始内容: %s", err, string(body))
	}
	return result.File.URI, nil
}

// AnalyzeMultiModalWithGemini 支持多模态（PDF、图片）分析，返回结构化结果
// fileURIs: PDF/图片等file_uri列表
// imageMIMEs: 与fileURIs一一对应的MIME类型，如"application/pdf"、"image/png"
// extraText: 附加文本内容
func (g *GeminiClient) AnalyzeMultiModalWithGemini(ctx context.Context, fileURIs []string, imageMIMEs []string, extraText string) (*PaperAnalysis, error) {
	os.Setenv("GEMINI_API_KEY", g.ApiKey)
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return nil, err
	}
	// defer client.Close() // 无Close方法

	// 构造多模态内容
	var parts []*genai.Part
	for i, uri := range fileURIs {
		mime := "application/pdf"
		if i < len(imageMIMEs) {
			mime = imageMIMEs[i]
		}
		parts = append(parts, genai.NewPartFromURI(uri, mime))
	}
	if extraText != "" {
		parts = append(parts, genai.NewPartFromText(extraText))
	}
	// 指定结构化输出prompt
	parts = append(parts, genai.NewPartFromText("请对上述论文及其多模态内容进行多维度分析，并以如下JSON结构输出：\n"+paperAnalysisJsonSchema))
	content := &genai.Content{Parts: parts}

	// 调用 Gemini
	resp, err := client.Models.GenerateContent(ctx, "gemini-2.5-flash", []*genai.Content{content}, nil)
	if err != nil {
		return nil, err
	}

	// 解析结构化JSON
	var result PaperAnalysis
	if err := json.Unmarshal([]byte(resp.Text()), &result); err != nil {
		return nil, fmt.Errorf("Gemini返回内容解析失败: %w, 原始内容: %s", err, resp.Text())
	}
	return &result, nil
}

// UploadFileToGemini 上传文件到Gemini File API，返回file_uri，支持进度回调
func UploadFileToGemini(ctx context.Context, apiKey, filePath, mimeType, displayName string, onProgress UploadProgressCallback) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("打开文件失败: %w", err)
	}
	defer file.Close()
	stat, err := file.Stat()
	if err != nil {
		return "", fmt.Errorf("获取文件信息失败: %w", err)
	}
	total := stat.Size()
	fileBytes := make([]byte, total)
	_, err = file.Read(fileBytes)
	if err != nil {
		return "", fmt.Errorf("读取文件内容失败: %w", err)
	}

	// 1. 启动resumable upload
	startURL := fmt.Sprintf("https://generativelanguage.googleapis.com/upload/v1beta/files?key=%s", apiKey)
	req, err := http.NewRequest("POST", startURL, nil)
	if err != nil {
		return "", fmt.Errorf("创建启动上传请求失败: %w", err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("启动上传请求失败: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("启动上传失败，状态码: %d, 响应: %s", resp.StatusCode, string(body))
	}
	uploadURL := resp.Header.Get("Location")
	if uploadURL == "" {
		return "", fmt.Errorf("未获取到上传URL")
	}

	// 2. 分块上传，支持进度回调
	const chunkSize = 2 * 1024 * 1024 // 2MB
	var uploaded int64 = 0
	for uploaded < total {
		end := uploaded + chunkSize
		if end > total {
			end = total
		}
		chunk := fileBytes[uploaded:end]
		chunkReader := bytes.NewReader(chunk)
		req, err := http.NewRequest("PUT", uploadURL, chunkReader)
		if err != nil {
			return "", fmt.Errorf("创建分块上传请求失败: %w", err)
		}
		rangeHeader := fmt.Sprintf("bytes %d-%d/%d", uploaded, end-1, total)
		req.Header.Set("Content-Range", rangeHeader)
		req.Header.Set("Content-Type", mimeType)
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return "", fmt.Errorf("分块上传请求失败: %w", err)
		}
		resp.Body.Close()
		if resp.StatusCode != 200 && resp.StatusCode != 201 && resp.StatusCode != 308 {
			return "", fmt.Errorf("分块上传失败，状态码: %d", resp.StatusCode)
		}
		uploaded = end
		if onProgress != nil && !onProgress(uploaded, total) {
			return "", fmt.Errorf("上传被用户中断")
		}
	}

	// 3. 获取file_uri（假设最后响应体中有file_uri，实际需根据API文档调整）
	// 这里仅做演示，实际应解析响应体
	fileURI := "file_uri_placeholder" // TODO: 解析真实file_uri
	return fileURI, nil
}

// Gemini多模态分析，详细错误处理
func (g *GeminiClient) AnalyzePaperWithFile(ctx context.Context, fileURI string, images [][]byte) (*PaperAnalysis, error) {
	if fileURI == "" {
		return nil, fmt.Errorf("fileURI不能为空")
	}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{APIKey: g.ApiKey})
	if err != nil {
		return nil, fmt.Errorf("Gemini SDK初始化失败: %w", err)
	}
	// defer client.Close() // genai.Client没有Close方法

	// 构造多模态输入
	var parts []*genai.Part
	// 文件部分
	parts = append(parts, genai.NewPartFromURI(fileURI, "application/pdf"))
	// 图片部分
	for _, img := range images {
		parts = append(parts, &genai.Part{
			InlineData: &genai.Blob{
				Data:     img,
				MIMEType: "image/png",
			},
		})
	}
	// prompt部分
	parts = append(parts, &genai.Part{
		Text: "请对论文进行结构化分析，输出JSON，字段包括basicInfo、summary、contentQuality等，具体结构见API文档。",
	})

	content := &genai.Content{Parts: parts}
	resp, err := client.Models.GenerateContent(ctx, "models/gemini-1.5-pro-latest", []*genai.Content{content}, nil)
	if err != nil {
		return nil, fmt.Errorf("Gemini内容生成失败: %w", err)
	}
	if resp == nil || len(resp.Candidates) == 0 || resp.Candidates[0].Content == nil {
		return nil, fmt.Errorf("Gemini无返回内容")
	}
	// 解析返回内容
	var text string
	if len(resp.Candidates[0].Content.Parts) > 0 {
		text = resp.Candidates[0].Content.Parts[0].Text
	} else {
		text = ""
	}
	var result PaperAnalysis
	err = json.Unmarshal([]byte(text), &result)
	if err != nil {
		return nil, fmt.Errorf("Gemini返回内容解析失败: %w, 原始内容: %s", err, text)
	}
	return &result, nil
}
