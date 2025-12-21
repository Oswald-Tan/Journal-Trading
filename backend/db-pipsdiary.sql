-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 21, 2025 at 02:53 AM
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
(13, 16, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-19 05:34:18', '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(14, 16, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-19 05:34:18', '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(15, 17, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-19 07:18:01', '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(16, 17, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-19 07:18:01', '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(17, 18, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-19 07:22:16', '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(18, 18, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-19 07:22:16', '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(19, 19, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-12-19 07:25:45', '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(20, 19, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-12-19 07:25:45', '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45');

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
-- Table structure for table `exchange_rates`
--

CREATE TABLE `exchange_rates` (
  `id` int NOT NULL,
  `fromCurrency` varchar(10) NOT NULL,
  `toCurrency` varchar(10) NOT NULL,
  `rate` decimal(20,12) NOT NULL,
  `effectiveFrom` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `effectiveTo` datetime DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `source` enum('api','manual','system') NOT NULL DEFAULT 'api',
  `lastUpdated` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `exchange_rates`
--

INSERT INTO `exchange_rates` (`id`, `fromCurrency`, `toCurrency`, `rate`, `effectiveFrom`, `effectiveTo`, `isActive`, `source`, `lastUpdated`, `createdAt`, `updatedAt`) VALUES
(23, 'IDR', 'USD', '0.000059863022', '2025-12-19 17:28:36', '2025-12-20 00:03:13', 0, 'api', '2025-12-20 00:03:13', '2025-12-19 17:28:36', '2025-12-20 00:03:13'),
(24, 'IDR', 'USD', '0.000059737147', '2025-12-20 00:03:13', NULL, 1, 'api', '2025-12-20 00:03:13', '2025-12-20 00:03:13', '2025-12-20 00:03:13'),
(25, 'EUR', 'USD', '1.171097199007', '2025-12-20 01:00:06', NULL, 1, 'api', '2025-12-20 01:00:06', '2025-12-20 01:00:06', '2025-12-20 01:00:06'),
(26, 'GBP', 'USD', '1.337720873550', '2025-12-20 01:00:06', NULL, 1, 'api', '2025-12-20 01:00:06', '2025-12-20 01:00:06', '2025-12-20 01:00:06'),
(27, 'JPY', 'USD', '0.006339665749', '2025-12-20 01:00:07', NULL, 1, 'api', '2025-12-20 01:00:07', '2025-12-20 01:00:07', '2025-12-20 01:00:07'),
(28, 'SGD', 'USD', '0.773466869736', '2025-12-20 01:00:07', NULL, 1, 'api', '2025-12-20 01:00:07', '2025-12-20 01:00:07', '2025-12-20 01:00:07'),
(29, 'AUD', 'USD', '0.661156939903', '2025-12-20 01:00:08', NULL, 1, 'api', '2025-12-20 01:00:08', '2025-12-20 01:00:08', '2025-12-20 01:00:08');

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
(65, 16, '2025-12', 1, 0, 0, '0.00', 0, '0.00', '2025-12-19 02:46:38', '2025-12-19 03:53:41');

-- --------------------------------------------------------

--
-- Table structure for table `period_leaderboards`
--

CREATE TABLE `period_leaderboards` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `periodType` enum('daily','weekly','monthly') NOT NULL,
  `periodValue` varchar(20) NOT NULL COMMENT 'daily=YYYY-MM-DD, weekly=YYYY-WW, monthly=YYYY-MM',
  `rank` int DEFAULT NULL,
  `score` int NOT NULL DEFAULT '0',
  `totalProfitUSD` decimal(20,4) NOT NULL DEFAULT '0.0000' COMMENT 'Profit yang sudah dikonversi ke USD',
  `totalProfitOriginal` decimal(20,4) NOT NULL DEFAULT '0.0000' COMMENT 'Profit dalam mata uang asli user',
  `originalCurrency` enum('USD','IDR','CENT') NOT NULL DEFAULT 'USD',
  `totalTrades` int NOT NULL DEFAULT '0',
  `winRate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `dailyActivity` int NOT NULL DEFAULT '0',
  `consistencyScore` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'Skor konsistensi trading',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `userLevel` int DEFAULT '1',
  `totalExperience` int DEFAULT '0',
  `dailyStreak` int DEFAULT '0',
  `total_trades_user` int DEFAULT '0',
  `profitStreak` int DEFAULT '0',
  `maxConsecutiveWins` int DEFAULT '0',
  `lastExchangeRate` decimal(20,12) NOT NULL DEFAULT '1.000000000000' COMMENT 'Rate yang digunakan saat terakhir konversi',
  `exchangeRateUpdatedAt` datetime DEFAULT NULL COMMENT 'Waktu terakhir update exchange rate'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `period_leaderboards`
--

INSERT INTO `period_leaderboards` (`id`, `userId`, `periodType`, `periodValue`, `rank`, `score`, `totalProfitUSD`, `totalProfitOriginal`, `originalCurrency`, `totalTrades`, `winRate`, `dailyActivity`, `consistencyScore`, `createdAt`, `updatedAt`, `userLevel`, `totalExperience`, `dailyStreak`, `total_trades_user`, `profitStreak`, `maxConsecutiveWins`, `lastExchangeRate`, `exchangeRateUpdatedAt`) VALUES
(13, 16, 'daily', '2025-12-19', 1, 3601, '1.9116', '32000.0000', 'IDR', 3, '100.00', 1, '0.00', '2025-12-19 05:34:18', '2025-12-21 02:30:01', 2, 330, 1, 3, 1, 3, '0.000059737147', '2025-12-21 02:30:01'),
(14, 16, 'weekly', '2025-W51', 1, 3344, '1.9116', '32000.0000', 'IDR', 3, '100.00', 1, '14.29', '2025-12-19 05:34:18', '2025-12-21 02:30:01', 2, 330, 1, 3, 1, 3, '0.000059737147', '2025-12-21 02:30:01'),
(15, 16, 'monthly', '2025-12', 1, 3154, '1.9116', '32000.0000', 'IDR', 3, '100.00', 1, '3.33', '2025-12-19 05:34:18', '2025-12-21 02:30:01', 2, 330, 1, 3, 1, 3, '0.000059737147', '2025-12-21 02:30:01'),
(22, 17, 'daily', '2025-12-19', 3, 3204, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '0.00', '2025-12-19 07:18:01', '2025-12-19 07:22:16', 2, 210, 1, 1, 1, 1, '1.000000000000', NULL),
(23, 17, 'weekly', '2025-W51', 3, 3214, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '14.29', '2025-12-19 07:18:01', '2025-12-19 07:22:16', 2, 210, 1, 1, 1, 1, '1.000000000000', NULL),
(24, 17, 'monthly', '2025-12', 3, 3077, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '3.33', '2025-12-19 07:18:01', '2025-12-19 07:22:16', 2, 210, 1, 1, 1, 1, '1.000000000000', NULL),
(28, 18, 'daily', '2025-12-19', 2, 3204, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '0.00', '2025-12-19 07:22:16', '2025-12-19 07:22:16', 2, 161, 1, 1, 1, 1, '1.000000000000', NULL),
(29, 18, 'weekly', '2025-W51', 2, 3214, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '14.29', '2025-12-19 07:22:16', '2025-12-19 07:22:16', 2, 161, 1, 1, 1, 1, '1.000000000000', NULL),
(30, 18, 'monthly', '2025-12', 2, 3077, '10.0000', '10.0000', 'USD', 1, '100.00', 1, '3.33', '2025-12-19 07:22:16', '2025-12-19 07:22:16', 2, 161, 1, 1, 1, 1, '1.000000000000', NULL),
(31, 19, 'daily', '2025-12-19', 4, 3202, '5.0000', '5.0000', 'USD', 1, '100.00', 1, '0.00', '2025-12-19 07:25:45', '2025-12-19 07:25:45', 2, 160, 1, 1, 1, 1, '1.000000000000', NULL),
(32, 19, 'weekly', '2025-W51', 4, 3212, '5.0000', '5.0000', 'USD', 1, '100.00', 1, '14.29', '2025-12-19 07:25:45', '2025-12-19 07:25:45', 2, 160, 1, 1, 1, 1, '1.000000000000', NULL),
(33, 19, 'monthly', '2025-12', 4, 3075, '5.0000', '5.0000', 'USD', 1, '100.00', 1, '3.33', '2025-12-19 07:25:45', '2025-12-19 07:25:45', 2, 160, 1, 1, 1, 1, '1.000000000000', NULL);

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
('zi0OMTiNsWNEXnRpHhrRWM78zP3DFv0D', '2025-12-22 02:23:10', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-22T02:23:10.766Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":16,\"role\":\"user\"}', '2025-12-21 02:23:10', '2025-12-21 02:23:10');

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
(120, 16, 'pro', '2026-01-20 16:40:51', 1, 'bank_transfer', 'ORDER-1766025998971-8763', '2025-12-17 19:28:22', '2025-12-20 16:40:51'),
(124, 17, 'free', NULL, 1, NULL, NULL, '2025-12-19 07:12:34', '2025-12-19 07:12:34'),
(125, 18, 'free', NULL, 1, NULL, NULL, '2025-12-19 07:20:33', '2025-12-19 07:20:33'),
(126, 19, 'free', NULL, 1, NULL, NULL, '2025-12-19 07:23:59', '2025-12-19 07:23:59');

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
(16, 16, 0, '0.00', NULL, '', '2025-12-18', 0, '0.00', '0.00', '2025-12-17 19:28:22', '2025-12-18 08:29:46'),
(17, 17, 0, '0.00', NULL, NULL, '2025-12-19', 0, '0.00', '0.00', '2025-12-19 07:12:34', '2025-12-19 07:12:34'),
(18, 18, 0, '0.00', NULL, NULL, '2025-12-19', 0, '0.00', '0.00', '2025-12-19 07:20:33', '2025-12-19 07:20:33'),
(19, 19, 0, '0.00', NULL, NULL, '2025-12-19', 0, '0.00', '0.00', '2025-12-19 07:23:59', '2025-12-19 07:23:59');

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
(89, 16, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4018.00000', '4000.00000', '4050.00000', '4047.00000', 50, '14000.00', '114000.00', 'Win', '1.50', 'Pullback', 'Volatile', 'Tenang', 'Puas', '', 'Keren', '2025-12-19 05:34:18', '2025-12-19 15:20:11'),
(90, 16, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4018.00000', '4000.00000', '4050.00000', '4047.00000', 40, '14000.00', '128000.00', 'Win', '1.50', 'Price Action', 'Volatile', 'Tenang', 'Puas', '', 'Keren', '2025-12-19 05:40:34', '2025-12-19 15:20:01'),
(91, 16, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3090.00000', '4020.00000', '4020.00000', 12, '4000.00', '132000.00', 'Win', '1.30', 'Supply & Demand / SMC', 'tsf', 'sdf', 'sdf', '', 'dfsd', '2025-12-19 07:08:06', '2025-12-19 15:19:51'),
(92, 17, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3070.00000', '4060.00000', '4060.00000', 60, '10.00', '110.00', 'Win', '1.50', 'Pullback', 'Trending', 'Tenang', 'Puas', '', 'Mantap', '2025-12-19 07:18:01', '2025-12-19 07:18:25'),
(93, 18, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3050.00000', '4060.00000', '4060.00000', 50, '10.00', '130.00', 'Win', '1.50', 'Breakout', 'sdfd', 'sdf', 'sdfs', '', 'sdf', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(94, 19, '2025-12-19', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3090.00000', '4020.00000', '4020.00000', 20, '5.00', '305.00', 'Win', '1.20', 'Session Trading', 'ghfhgf', 'fghfgh', 'fhf', '', 'fghfg', '2025-12-19 07:25:44', '2025-12-19 07:25:44');

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

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `invoice_number`, `total`, `status`, `customer_name`, `customer_email`, `snap_token`, `snap_redirect_url`, `payment_method`, `plan`, `user_id`, `midtrans_transaction_id`, `transaction_time`, `metadata`, `created_at`, `updated_at`) VALUES
('ORDER-1766025998971-8763', 'INV/PD/2025/12/18/000001', 49000, 'PAID', 'Oswald Tan', 'oswaldpongayow@gmail.com', '6a8bae1b-dacc-419c-85a7-a162f2968407', 'https://app.sandbox.midtrans.com/snap/v4/redirection/6a8bae1b-dacc-419c-85a7-a162f2968407', 'bank_transfer', 'pro', 16, 'b4e8a84c-ad9f-4384-b17a-03822438df35', '2025-12-18 01:47:10', NULL, '2025-12-18 02:46:39', '2025-12-18 02:47:18'),
('ORDER-1766046613538-7675', 'INV/PD/2025/12/18/000002', 69000, 'PENDING_PAYMENT', 'Oswald Tan', 'oswaldpongayow@gmail.com', 'da89b4cf-55ec-4f14-8261-6c7c244ded79', 'https://app.sandbox.midtrans.com/snap/v4/redirection/da89b4cf-55ec-4f14-8261-6c7c244ded79', NULL, 'pro', 16, NULL, NULL, NULL, '2025-12-18 08:30:14', '2025-12-18 08:30:14'),
('ORDER-1766046645573-3066', 'INV/PD/2025/12/18/000003', 69000, 'PENDING_PAYMENT', 'Oswald Tan', 'oswaldpongayow@gmail.com', '4ad1dd85-2291-4c81-92dc-edbf0a790a6d', 'https://app.sandbox.midtrans.com/snap/v4/redirection/4ad1dd85-2291-4c81-92dc-edbf0a790a6d', NULL, 'pro', 16, NULL, NULL, NULL, '2025-12-18 08:30:46', '2025-12-18 08:30:46'),
('ORDER-1766154545180-7283', 'INV/PD/2025/12/19/000001', 799000, 'PAID', 'Oswald Tan', 'oswaldpongayow@gmail.com', '74aec04a-7eb4-4dd9-92c5-dbda2a56ba3e', 'https://app.sandbox.midtrans.com/snap/v4/redirection/74aec04a-7eb4-4dd9-92c5-dbda2a56ba3e', 'bank_transfer', 'lifetime', 16, '0fa14767-21f0-4335-a05c-799be7115343', '2025-12-19 13:29:41', NULL, '2025-12-19 14:29:05', '2025-12-19 14:29:49');

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
  `country` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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

INSERT INTO `users` (`id`, `name`, `email`, `phone_number`, `password`, `initialBalance`, `currentBalance`, `currency`, `role_id`, `country`, `status`, `last_login`, `resetOtp`, `resetOtpExpires`, `emailVerificationToken`, `emailVerificationExpires`, `created_at`, `updated_at`) VALUES
(16, 'Oswald Tan', 'oswaldpongayow@gmail.com', '0821549026917', '$2b$10$6qV7fkogeLLSORiYNn7cJO/SwDTijsGvTBLXfUHagYAIa7rSuboNe', '100000.00', '132000.00', 'IDR', 1, NULL, 'active', '2025-12-21 02:30:25', NULL, NULL, 'd08588b7760cdb0cb41a78a6134619feac6817ea01d7f9d2201dbf2945c8fc39', '2025-12-18 19:32:50', '2025-12-17 19:28:22', '2025-12-21 02:30:25'),
(17, 'Oswald Work', 'oswaldtanwork@gmail.com', NULL, '$2b$10$EqIaqOv0Evpfti5IGBXXauLHLrs/Y3SZf424it8f7xBfPevw74THO', '100.00', '110.00', 'USD', 1, NULL, 'active', '2025-12-19 07:16:52', NULL, NULL, NULL, NULL, '2025-12-19 07:12:33', '2025-12-19 07:18:25'),
(18, 'Tanlee 44', 'oswaldtanlee444@gmail.com', NULL, '$2b$10$tUnSp9oes0K0q3GVhv1nQeGT0YLGjTnC2aC51arEsCAZyxFXrK0r6', '120.00', '130.00', 'USD', 1, NULL, 'active', '2025-12-19 07:21:17', NULL, NULL, NULL, NULL, '2025-12-19 07:20:33', '2025-12-19 07:22:16'),
(19, 'Indah', 'ptdtb.dev@gmail.com', NULL, '$2b$10$Z.wVYic6JzlcEw5ygTIVCuBD.Tv8h/OI5PvqB1ka574Iu3SiMbPV6', '300.00', '305.00', 'USD', 1, NULL, 'active', '2025-12-19 07:25:00', NULL, NULL, NULL, NULL, '2025-12-19 07:23:59', '2025-12-19 07:25:44');

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
(46, 16, 16, 1, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(47, 16, 17, 1, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(48, 16, 18, 1, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(49, 16, 19, 1, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(50, 16, 20, 1, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(51, 16, 21, 1, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(52, 16, 22, 1, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(53, 16, 23, 1, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(54, 16, 24, 1, '2025-12-19 05:34:18', '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(55, 16, 25, 3, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 07:08:06'),
(56, 16, 26, 3, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 07:08:06'),
(57, 16, 27, 3, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 07:08:06'),
(58, 16, 28, 3, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 07:08:06'),
(59, 16, 29, 0, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(60, 16, 30, 0, NULL, '{}', '2025-12-19 05:34:18', '2025-12-19 05:34:18'),
(61, 17, 16, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(62, 17, 17, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(63, 17, 18, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(64, 17, 19, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(65, 17, 20, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(66, 17, 21, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(67, 17, 22, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(68, 17, 23, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(69, 17, 24, 1, '2025-12-19 07:18:01', '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(70, 17, 25, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(71, 17, 26, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(72, 17, 27, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(73, 17, 28, 1, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(74, 17, 29, 0, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(75, 17, 30, 0, NULL, '{}', '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(76, 18, 16, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(77, 18, 17, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(78, 18, 18, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(79, 18, 19, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(80, 18, 20, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(81, 18, 21, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(82, 18, 22, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(83, 18, 23, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(84, 18, 24, 1, '2025-12-19 07:22:16', '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(85, 18, 25, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(86, 18, 26, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(87, 18, 27, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(88, 18, 28, 1, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(89, 18, 29, 0, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(90, 18, 30, 0, NULL, '{}', '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(91, 19, 16, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(92, 19, 17, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(93, 19, 18, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(94, 19, 19, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(95, 19, 20, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(96, 19, 21, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(97, 19, 22, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(98, 19, 23, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(99, 19, 24, 1, '2025-12-19 07:25:45', '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(100, 19, 25, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(101, 19, 26, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(102, 19, 27, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(103, 19, 28, 1, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(104, 19, 29, 0, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45'),
(105, 19, 30, 0, NULL, '{}', '2025-12-19 07:25:45', '2025-12-19 07:25:45');

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
(8, 16, 2, 230, 330, 1, '2025-12-19', 1, '2025-12-19', 3, 3, 3, '2025-12-19 05:34:18', '2025-12-19 07:08:06'),
(9, 17, 2, 110, 210, 1, '2025-12-19', 1, '2025-12-19', 1, 1, 1, '2025-12-19 07:18:01', '2025-12-19 07:18:01'),
(10, 18, 2, 61, 161, 1, '2025-12-19', 1, '2025-12-19', 1, 1, 1, '2025-12-19 07:22:16', '2025-12-19 07:22:16'),
(11, 19, 2, 60, 160, 1, '2025-12-19', 1, '2025-12-19', 1, 1, 1, '2025-12-19 07:25:44', '2025-12-19 07:25:45');

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
-- Indexes for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_currency_active` (`fromCurrency`,`toCurrency`,`isActive`),
  ADD KEY `idx_effective_from` (`effectiveFrom`),
  ADD KEY `idx_last_updated` (`lastUpdated`);

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
-- Indexes for table `period_leaderboards`
--
ALTER TABLE `period_leaderboards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_period` (`userId`,`periodType`,`periodValue`),
  ADD KEY `idx_period_rank` (`periodType`,`periodValue`,`rank`),
  ADD KEY `idx_period_value` (`periodValue`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
-- AUTO_INCREMENT for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `monthly_leaderboards`
--
ALTER TABLE `monthly_leaderboards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `period_leaderboards`
--
ALTER TABLE `period_leaderboards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=133;

--
-- AUTO_INCREMENT for table `targets`
--
ALTER TABLE `targets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `trades`
--
ALTER TABLE `trades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `user_levels`
--
ALTER TABLE `user_levels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
-- Constraints for table `period_leaderboards`
--
ALTER TABLE `period_leaderboards`
  ADD CONSTRAINT `fk_period_leaderboards_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
