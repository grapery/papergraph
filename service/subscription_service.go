package service

import (
	"papergraph/model"
	"time"

	"gorm.io/gorm"
)

// 订阅服务结构体
// 依赖数据库实例
// 可通过 NewSubscriptionService 创建

type SubscriptionService struct {
	db          *gorm.DB
	badgeService *BadgeService
}

// 创建订阅服务实例
func NewSubscriptionService(db *gorm.DB) *SubscriptionService {
	return &SubscriptionService{db: db, badgeService: NewBadgeService(db)}
}

// 查询所有订阅产品
func (s *SubscriptionService) ListProducts() ([]model.Product, error) {
	var products []model.Product
	err := s.db.Find(&products).Error
	return products, err
}

// 创建用户订阅记录
func (s *SubscriptionService) CreateUserSubscription(userID, productID uint, duration int) error {
	now := time.Now()
	end := now.AddDate(0, duration, 0)
	sub := model.UserSubscription{
		UserID:    userID,
		ProductID: productID,
		StartTime: now,
		EndTime:   end,
		Status:    "active",
	}
	
	// 创建订阅记录
	if err := s.db.Create(&sub).Error; err != nil {
		return err
	}
	
	// 获取产品信息以颁发奖章
	var product model.Product
	if err := s.db.First(&product, productID).Error; err != nil {
		return err
	}
	
	// 颁发订阅相关奖章
	if err := s.badgeService.AwardSubscriptionBadge(userID, product.Name); err != nil {
		// 奖章颁发失败不影响订阅创建，只记录日志
		// 在实际项目中可以使用日志记录
	}
	
	return nil
}

// 扣减用户免费试用次数
func (s *SubscriptionService) DecrementFreeTrial(userID uint) error {
	return s.db.Model(&model.User{}).Where("id = ? AND free_trial_count > 0", userID).UpdateColumn("free_trial_count", gorm.Expr("free_trial_count - 1")).Error
}

// 查询用户剩余免费试用次数
func (s *SubscriptionService) GetFreeTrialCount(userID uint) (int, error) {
	var user model.User
	err := s.db.Select("free_trial_count").First(&user, userID).Error
	return user.FreeTrialCount, err
}

// 写入支付记录
func (s *SubscriptionService) CreatePaymentRecord(rec *model.PaymentRecord) error {
	return s.db.Create(rec).Error
}

// 查询用户支付记录
func (s *SubscriptionService) ListPaymentRecords(userID uint) ([]model.PaymentRecord, error) {
	var records []model.PaymentRecord
	err := s.db.Where("user_id = ?", userID).Find(&records).Error
	return records, err
}

// 查询用户订阅记录
func (s *SubscriptionService) ListUserSubscriptions(userID uint) ([]model.UserSubscription, error) {
	var subs []model.UserSubscription
	err := s.db.Where("user_id = ?", userID).Find(&subs).Error
	return subs, err
}
