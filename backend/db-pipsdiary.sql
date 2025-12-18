-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 17, 2025 at 07:53 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db-pipsdiary`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `type` enum('first_trade','first_profit','weekly_consistency','monthly_consistency','profit_milestone','trade_milestone') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `achievedAt` datetime NOT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `userId`, `type`, `title`, `description`, `achievedAt`, `metadata`, `createdAt`, `updatedAt`) VALUES
(9, 16, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-17 19:35:40', '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(10, 16, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-17 19:35:40', '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `badges`
--

CREATE TABLE `badges` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('consistency','profit','milestone','achievement','special') NOT NULL,
  `icon` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT '#8b5cf6',
  `requirement` json NOT NULL,
  `rarity` enum('common','rare','epic','legendary') DEFAULT 'common',
  `xpReward` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `badges`
--

INSERT INTO `badges` (`id`, `name`, `description`, `type`, `icon`, `color`, `requirement`, `rarity`, `xpReward`, `createdAt`, `updatedAt`) VALUES
(16, 'Early Bird', 'Log trades for 3 consecutive days', 'consistency', 'calendar', '#f59e0b', '{\"type\": \"daily_streak\", \"value\": 3}', 'common', 50, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(17, 'Dedicated Trader', 'Log trades for 7 consecutive days', 'consistency', 'trending-up', '#ef4444', '{\"type\": \"daily_streak\", \"value\": 7}', 'rare', 100, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(18, 'Trading Warrior', 'Log trades for 30 consecutive days', 'consistency', 'shield', '#8b5cf6', '{\"type\": \"daily_streak\", \"value\": 30}', 'epic', 500, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(19, 'Legendary Consistency', 'Log trades for 90 consecutive days', 'consistency', 'crown', '#f59e0b', '{\"type\": \"daily_streak\", \"value\": 90}', 'legendary', 1000, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(20, 'Profit Starter', 'Make profit for 2 trades in a row', 'profit', 'dollar-sign', '#10b981', '{\"type\": \"profit_streak\", \"value\": 2}', 'common', 75, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(21, 'Hot Streak', 'Make profit for 5 trades in a row', 'profit', 'flame', '#ef4444', '{\"type\": \"profit_streak\", \"value\": 5}', 'rare', 200, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(22, 'Profit King', 'Make profit for 10 trades in a row', 'profit', 'award', '#f59e0b', '{\"type\": \"profit_streak\", \"value\": 10}', 'epic', 500, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(23, 'Unstoppable', 'Make profit for 20 trades in a row', 'profit', 'zap', '#8b5cf6', '{\"type\": \"profit_streak\", \"value\": 20}', 'legendary', 1000, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(24, 'First Step', 'Complete your first trade', 'milestone', 'flag', '#6b7280', '{\"type\": \"total_trades\", \"value\": 1}', 'common', 25, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(25, 'Apprentice Trader', 'Complete 10 trades', 'milestone', 'user', '#10b981', '{\"type\": \"total_trades\", \"value\": 10}', 'common', 100, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(26, 'Seasoned Trader', 'Complete 50 trades', 'milestone', 'bar-chart', '#3b82f6', '{\"type\": \"total_trades\", \"value\": 50}', 'rare', 250, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(27, 'Master Trader', 'Complete 100 trades', 'milestone', 'star', '#8b5cf6', '{\"type\": \"total_trades\", \"value\": 100}', 'epic', 500, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(28, 'Trading Legend', 'Complete 500 trades', 'milestone', 'crown', '#f59e0b', '{\"type\": \"total_trades\", \"value\": 500}', 'legendary', 2000, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(29, 'Risk Manager', 'Maintain positive risk-reward ratio for 10 trades', 'achievement', 'shield', '#10b981', '{\"type\": \"risk_reward_positive\", \"value\": 10}', 'rare', 150, '2025-12-17 19:31:06', '2025-12-17 19:31:06'),
(30, 'Disciplined Trader', 'Use stop loss in 20 consecutive trades', 'achievement', 'target', '#3b82f6', '{\"type\": \"stop_loss_used\", \"value\": 20}', 'epic', 300, '2025-12-17 19:31:06', '2025-12-17 19:31:06');

-- --------------------------------------------------------

--
-- Table structure for table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `date` date NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('market_news','economic_event','trade_idea','reminder','trade_review','journal_entry') DEFAULT 'journal_entry',
  `description` text,
  `time` varchar(5) DEFAULT NULL COMMENT 'Format HH:mm (e.g., 14:30)',
  `impact` enum('high','medium','low','none') DEFAULT 'none',
  `instrument` varchar(255) DEFAULT NULL,
  `strategy` varchar(255) DEFAULT NULL,
  `sentiment` enum('bullish','bearish','neutral') DEFAULT 'neutral',
  `color` varchar(20) DEFAULT '#8b5cf6',
  `isCompleted` tinyint(1) DEFAULT '0',
  `relatedTradeId` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `monthly_leaderboards`
--

CREATE TABLE `monthly_leaderboards` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `period` varchar(255) NOT NULL,
  `rank` int DEFAULT NULL,
  `score` int DEFAULT '0',
  `totalTrades` int DEFAULT '0',
  `totalProfit` decimal(15,2) DEFAULT '0.00',
  `totalExperience` int DEFAULT '0',
  `winRate` decimal(5,2) DEFAULT '0.00',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `monthly_leaderboards`
--

INSERT INTO `monthly_leaderboards` (`id`, `userId`, `period`, `rank`, `score`, `totalTrades`, `totalProfit`, `totalExperience`, `winRate`, `createdAt`, `updatedAt`) VALUES
(50, 16, '2025-12', 1, 3049, 1, '12000.00', 0, '100.00', '2025-12-17 19:35:40', '2025-12-17 19:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `role_name` enum('super_admin','admin','premium_user','user','viewer') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'user');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `sid` varchar(36) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`sid`, `expires`, `data`, `createdAt`, `updatedAt`) VALUES
('0MRTNHuSWVYIxJaTndRhRBsfNMFdRZqY', '2025-12-18 06:30:52', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-18T06:30:52.038Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-17 06:30:52', '2025-12-17 06:30:52'),
('6nSD6uSfybZLsKAsxaUueM86epslnywg', '2025-12-18 19:35:46', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-18T19:34:23.145Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":16,\"role\":\"user\"}', '2025-12-17 06:30:52', '2025-12-17 19:35:46'),
('bbPQTftrOK_kG4_x30PERTt77pnIOFpW', '2025-12-18 06:30:52', '{\"cookie\":{\"originalMaxAge\":86399999,\"expires\":\"2025-12-18T06:30:52.012Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-17 06:30:52', '2025-12-17 06:30:52'),
('NAOSsaRIZ-9LbT83QGxoSqeMPXyacjR0', '2025-12-18 06:30:52', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-18T06:30:52.029Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"}}', '2025-12-17 06:30:52', '2025-12-17 06:30:52'),
('QvEFv-95AbnxtstF-DR5-v5KZgajlpkE', '2025-12-18 06:27:47', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-17T06:28:50.651Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":7,\"role\":\"user\"}', '2025-12-16 06:22:57', '2025-12-17 06:27:47'),
('Tfd258IwmdNtMqMh7QwPSP8lqPAixNZb', '2025-12-18 07:32:57', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-18T07:32:54.529Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":7,\"role\":\"user\"}', '2025-12-17 07:32:48', '2025-12-17 07:32:57'),
('VNWRxqVPrTr3tdc3iCp5z3LtMycb4T3-', '2025-12-18 02:52:01', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-17T05:45:34.863Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":7,\"role\":\"user\"}', '2025-12-16 05:45:34', '2025-12-17 02:52:01');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `userId` int NOT NULL,
  `plan` enum('free','pro','lifetime') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'free',
  `expiresAt` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `paymentMethod` varchar(255) DEFAULT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `userId`, `plan`, `expiresAt`, `isActive`, `paymentMethod`, `transactionId`, `created_at`, `updated_at`) VALUES
(120, 16, 'free', NULL, 1, NULL, NULL, '2025-12-17 19:28:22', '2025-12-17 19:28:22');

-- --------------------------------------------------------

--
-- Table structure for table `targets`
--

CREATE TABLE `targets` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `enabled` tinyint(1) DEFAULT '0',
  `targetBalance` decimal(15,2) DEFAULT '0.00',
  `targetDate` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `startDate` date DEFAULT NULL,
  `useDailyTarget` tinyint(1) NOT NULL DEFAULT '0',
  `dailyTargetPercentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `dailyTargetAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `targets`
--

INSERT INTO `targets` (`id`, `userId`, `enabled`, `targetBalance`, `targetDate`, `description`, `startDate`, `useDailyTarget`, `dailyTargetPercentage`, `dailyTargetAmount`, `created_at`, `updated_at`) VALUES
(16, 16, 0, '0.00', NULL, NULL, '2025-12-18', 0, '0.00', '0.00', '2025-12-17 19:28:22', '2025-12-17 19:28:22');

-- --------------------------------------------------------

--
-- Table structure for table `trades`
--

CREATE TABLE `trades` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `date` date NOT NULL,
  `instrument` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Buy','Sell') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lot` decimal(10,2) NOT NULL,
  `entry` decimal(15,5) NOT NULL,
  `stop` decimal(15,5) DEFAULT NULL,
  `take` decimal(15,5) DEFAULT NULL,
  `exit` decimal(15,5) DEFAULT NULL,
  `pips` int DEFAULT '0',
  `profit` decimal(15,2) DEFAULT '0.00',
  `balanceAfter` decimal(15,2) NOT NULL,
  `result` enum('Win','Lose','Break Even','Pending') COLLATE utf8mb4_unicode_ci NOT NULL,
  `riskReward` decimal(5,2) DEFAULT '0.00',
  `strategy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `market` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emotionBefore` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emotionAfter` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `screenshot` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trades`
--

INSERT INTO `trades` (`id`, `userId`, `date`, `instrument`, `type`, `lot`, `entry`, `stop`, `take`, `exit`, `pips`, `profit`, `balanceAfter`, `result`, `riskReward`, `strategy`, `market`, `emotionBefore`, `emotionAfter`, `screenshot`, `notes`, `created_at`, `updated_at`) VALUES
(72, 16, '2025-12-17', 'XAUUSD', 'Buy', '0.01', '4018.00000', '4000.00000', '4050.00000', '4047.00000', 10, '12000.00', '112000.00', 'Win', '1.50', 'SnR', 'Bullish', 'Keren', 'Mantap', '', 'Test', '2025-12-17 19:35:40', '2025-12-17 19:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(110) NOT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `total` int NOT NULL,
  `status` enum('PENDING_PAYMENT','PAID','CANCELED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `snap_token` text,
  `snap_redirect_url` text,
  `payment_method` varchar(50) DEFAULT NULL,
  `plan` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `midtrans_transaction_id` varchar(100) DEFAULT NULL,
  `transaction_time` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initialBalance` decimal(15,2) DEFAULT '0.00',
  `currentBalance` decimal(15,2) DEFAULT '0.00',
  `currency` enum('USD','IDR','CENT') COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `role_id` int DEFAULT NULL,
  `status` enum('active','suspended','inactive','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `last_login` datetime DEFAULT NULL COMMENT 'Timestamp login terakhir',
  `resetOtp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetOtpExpires` datetime DEFAULT NULL,
  `emailVerificationToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailVerificationExpires` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone_number`, `password`, `initialBalance`, `currentBalance`, `currency`, `role_id`, `status`, `last_login`, `resetOtp`, `resetOtpExpires`, `emailVerificationToken`, `emailVerificationExpires`, `created_at`, `updated_at`) VALUES
(16, 'Oswald Tan', 'oswaldpongayow@gmail.com', NULL, '$2b$10$6qV7fkogeLLSORiYNn7cJO/SwDTijsGvTBLXfUHagYAIa7rSuboNe', '100000.00', '112000.00', 'IDR', 1, 'active', '2025-12-17 19:34:23', NULL, NULL, 'd08588b7760cdb0cb41a78a6134619feac6817ea01d7f9d2201dbf2945c8fc39', '2025-12-18 19:32:50', '2025-12-17 19:28:22', '2025-12-17 19:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `badgeId` int NOT NULL,
  `progress` int DEFAULT '0',
  `achievedAt` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_badges`
--

INSERT INTO `user_badges` (`id`, `userId`, `badgeId`, `progress`, `achievedAt`, `metadata`, `createdAt`, `updatedAt`) VALUES
(16, 16, 16, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(17, 16, 17, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(18, 16, 18, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(19, 16, 19, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(20, 16, 20, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(21, 16, 21, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(22, 16, 22, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(23, 16, 23, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(24, 16, 24, 1, '2025-12-17 19:35:40', '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(25, 16, 25, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(26, 16, 26, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(27, 16, 27, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(28, 16, 28, 1, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(29, 16, 29, 0, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40'),
(30, 16, 30, 0, NULL, '{}', '2025-12-17 19:35:40', '2025-12-17 19:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `user_levels`
--

CREATE TABLE `user_levels` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `level` int DEFAULT '1',
  `experience` int DEFAULT '0',
  `totalExperience` int DEFAULT '0',
  `dailyStreak` int DEFAULT '0',
  `lastActiveDate` date DEFAULT NULL,
  `profitStreak` int DEFAULT '0',
  `lastProfitDate` date DEFAULT NULL,
  `totalTrades` int DEFAULT '0',
  `consecutiveWins` int DEFAULT '0',
  `maxConsecutiveWins` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_levels`
--

INSERT INTO `user_levels` (`id`, `userId`, `level`, `experience`, `totalExperience`, `dailyStreak`, `lastActiveDate`, `profitStreak`, `lastProfitDate`, `totalTrades`, `consecutiveWins`, `maxConsecutiveWins`, `createdAt`, `updatedAt`) VALUES
(6, 16, 2, 110, 210, 1, '2025-12-17', 1, '2025-12-17', 1, 1, 1, '2025-12-17 19:35:40', '2025-12-17 19:35:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_type` (`userId`,`type`),
  ADD KEY `achievements_user_id_type` (`userId`,`type`);

--
-- Indexes for table `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_calendar_user_date` (`userId`,`date`),
  ADD KEY `idx_calendar_user_type` (`userId`,`type`);

--
-- Indexes for table `monthly_leaderboards`
--
ALTER TABLE `monthly_leaderboards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_period` (`userId`,`period`),
  ADD UNIQUE KEY `monthly_leaderboards_user_id_period` (`userId`,`period`),
  ADD KEY `idx_period_rank` (`period`,`rank`),
  ADD KEY `monthly_leaderboards_period_rank` (`period`,`rank`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_roles_role_name` (`role_name`),
  ADD UNIQUE KEY `roles_role_name` (`role_name`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sid`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `userId` (`userId`),
  ADD KEY `fk_subscriptions_transaction` (`transactionId`);

--
-- Indexes for table `targets`
--
ALTER TABLE `targets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `trades`
--
ALTER TABLE `trades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_date` (`userId`,`date`),
  ADD KEY `idx_user_instrument` (`userId`,`instrument`),
  ADD KEY `trades_user_id_date` (`userId`,`date`),
  ADD KEY `trades_user_id_instrument` (`userId`,`instrument`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `fk_transactions_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`),
  ADD UNIQUE KEY `email_62` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- Indexes for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_badge` (`userId`,`badgeId`),
  ADD UNIQUE KEY `user_badges_user_id_badge_id` (`userId`,`badgeId`),
  ADD KEY `badgeId` (`badgeId`);

--
-- Indexes for table `user_levels`
--
ALTER TABLE `user_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `monthly_leaderboards`
--
ALTER TABLE `monthly_leaderboards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `targets`
--
ALTER TABLE `targets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `trades`
--
ALTER TABLE `trades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `user_levels`
--
ALTER TABLE `user_levels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD CONSTRAINT `fk_calendar_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `monthly_leaderboards`
--
ALTER TABLE `monthly_leaderboards`
  ADD CONSTRAINT `monthly_leaderboards_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscriptions_transaction` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `targets`
--
ALTER TABLE `targets`
  ADD CONSTRAINT `targets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trades`
--
ALTER TABLE `trades`
  ADD CONSTRAINT `trades_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_107` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_badges_ibfk_108` FOREIGN KEY (`badgeId`) REFERENCES `badges` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user_levels`
--
ALTER TABLE `user_levels`
  ADD CONSTRAINT `user_levels_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
