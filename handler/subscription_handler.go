package handler

import (
	"papergraph/model"
	"papergraph/service"
	"papergraph/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// 订阅相关处理器结构体
// 依赖订阅服务

type SubscriptionHandler struct {
	Service *service.SubscriptionService
}

// 创建订阅处理器实例
func NewSubscriptionHandler(svc *service.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{Service: svc}
}

// 获取所有订阅产品
func (h *SubscriptionHandler) ListProducts(c *gin.Context) {
	products, err := h.Service.ListProducts()
	if err != nil {
		utils.FailWithMsg(c, "获取产品失败")
		return
	}
	utils.OkWithData(c, products)
}

// 购买订阅（伪实现，实际应集成支付SDK）
func (h *SubscriptionHandler) BuySubscription(c *gin.Context) {
	var req struct {
		ProductID uint   `json:"product_id"`
		PayMethod string `json:"pay_method"` // stripe, alipay
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.FailWithMsg(c, "参数错误")
		return
	}
	userID, _ := strconv.ParseUint(c.GetString("user_id"), 10, 64)
	// 查询产品
	products, _ := h.Service.ListProducts()
	var product *model.Product
	for _, p := range products {
		if p.ID == req.ProductID {
			product = &p
			break
		}
	}
	if product == nil {
		utils.FailWithMsg(c, "产品不存在")
		return
	}
	// 伪支付流程
	// 实际应调用支付SDK
	payRecord := &model.PaymentRecord{
		UserID:    uint(userID),
		ProductID: product.ID,
		Amount:    product.Price,
		PayMethod: req.PayMethod,
		PayTime:   utils.Now(),
		Status:    "success",
		TradeNo:   "mock_trade_no",
	}
	_ = h.Service.CreatePaymentRecord(payRecord)
	// 创建订阅
	_ = h.Service.CreateUserSubscription(uint(userID), product.ID, product.Duration)
	utils.OkWithMsg(c, "购买成功")
}

// 查询用户剩余免费试用次数
func (h *SubscriptionHandler) GetFreeTrialCount(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.GetString("user_id"), 10, 64)
	count, err := h.Service.GetFreeTrialCount(uint(userID))
	if err != nil {
		utils.FailWithMsg(c, "查询失败")
		return
	}
	utils.OkWithData(c, gin.H{"free_trial_count": count})
}

// 扣减用户免费试用次数
func (h *SubscriptionHandler) DecrementFreeTrial(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.GetString("user_id"), 10, 64)
	err := h.Service.DecrementFreeTrial(uint(userID))
	if err != nil {
		utils.FailWithMsg(c, "扣减失败或次数已用完")
		return
	}
	utils.OkWithMsg(c, "扣减成功")
}

// 查询用户支付记录
func (h *SubscriptionHandler) ListPaymentRecords(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.GetString("user_id"), 10, 64)
	records, err := h.Service.ListPaymentRecords(uint(userID))
	if err != nil {
		utils.FailWithMsg(c, "查询失败")
		return
	}
	utils.OkWithData(c, records)
}

// 查询用户订阅记录
func (h *SubscriptionHandler) ListUserSubscriptions(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.GetString("user_id"), 10, 64)
	subs, err := h.Service.ListUserSubscriptions(uint(userID))
	if err != nil {
		utils.FailWithMsg(c, "查询失败")
		return
	}
	utils.OkWithData(c, subs)
}
