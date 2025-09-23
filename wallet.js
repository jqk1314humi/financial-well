// wallet.js - 钱包功能管理

// 存储钱包数据的键名
const WALLET_DATA_KEY = 'dzchy_wallet_data';

// 汇率设置
const EXCHANGE_RATES = {
    DZCNY: {
        USDT: 7.12,  // 7.12 DZCNY = 1 USDT
        USDC: 1/7.39 // 1 DZCNY = 7.39 USDC
    },
    USDT: {
        DZCNY: 7.12  // 1 USDT = 7.12 DZCNY
    },
    USDC: {
        DZCNY: 7.39  // 1 USDC = 1/7.39 DZCNY
    }
};

// 初始化钱包数据存储
function initWalletData() {
    // 检查localStorage中是否已有钱包数据
    if (!localStorage.getItem(WALLET_DATA_KEY)) {
        // 创建默认的空钱包数据对象
        const defaultWallet = {
            wallets: []
        };
        // 保存到localStorage
        localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(defaultWallet));
    }
}

// 获取用户的钱包信息
function getUserWallet(username) {
    // 初始化钱包数据
    initWalletData();
    
    // 获取现有的钱包数据
    const walletData = JSON.parse(localStorage.getItem(WALLET_DATA_KEY));
    
    // 查找匹配的用户钱包
    let userWallet = walletData.wallets.find(wallet => wallet.username === username);
    
    // 如果用户没有钱包，创建一个新的
    if (!userWallet) {
        userWallet = {
            username: username,
            balances: {
                DZCNY: 0,
                USDT: 0,
                USDC: 0
            },
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        // 添加新钱包到钱包数据
        walletData.wallets.push(userWallet);
        
        // 保存更新后的钱包数据
        localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(walletData));
    }
    
    // 确保所有币种都有余额字段
    if (!userWallet.balances) {
        userWallet.balances = {
            DZCNY: userWallet.balance || 0,
            USDT: 0,
            USDC: 0
        };
        // 移除旧的balance字段
        delete userWallet.balance;
        delete userWallet.lockedBalance;
        userWallet.lastUpdated = new Date().toISOString();
        
        // 保存更新后的钱包数据
        localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(walletData));
    } else if (!userWallet.balances.USDT || !userWallet.balances.USDC) {
        userWallet.balances.USDT = userWallet.balances.USDT || 0;
        userWallet.balances.USDC = userWallet.balances.USDC || 0;
        userWallet.lastUpdated = new Date().toISOString();
        
        // 保存更新后的钱包数据
        localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(walletData));
    }
    
    return userWallet;
}

// 获取用户DZCNY余额
function getUserDZCHYBalance(username) {
    const userWallet = getUserWallet(username);
    return userWallet.balances.DZCNY;
}

// 获取用户USDT余额
function getUserUSDTBalance(username) {
    const userWallet = getUserWallet(username);
    return userWallet.balances.USDT;
}

// 获取用户USDC余额
function getUserUSDCBalance(username) {
    const userWallet = getUserWallet(username);
    return userWallet.balances.USDC;
}

// 获取用户锁定余额
function getUserLockedBalance(username) {
    const userWallet = getUserWallet(username);
    return userWallet.lockedBalance;
}

// 更新用户指定币种余额
function updateUserBalance(username, currency, amount) {
    // 初始化钱包数据
    initWalletData();
    
    // 获取现有的钱包数据
    const walletData = JSON.parse(localStorage.getItem(WALLET_DATA_KEY));
    
    // 查找匹配的用户钱包
    let userWallet = walletData.wallets.find(wallet => wallet.username === username);
    
    // 如果用户没有钱包，创建一个新的
    if (!userWallet) {
        userWallet = {
            username: username,
            balances: {
                DZCNY: 0,
                USDT: 0,
                USDC: 0
            },
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        walletData.wallets.push(userWallet);
    }
    
    // 确保有balances对象
    if (!userWallet.balances) {
        userWallet.balances = {
            DZCNY: userWallet.balance || 0,
            USDT: 0,
            USDC: 0
        };
        // 移除旧的balance字段
        delete userWallet.balance;
        delete userWallet.lockedBalance;
    }
    
    // 确保指定币种有余额字段
    if (userWallet.balances[currency] === undefined) {
        userWallet.balances[currency] = 0;
    }
    
    // 更新余额
    userWallet.balances[currency] = Math.max(0, userWallet.balances[currency] + amount); // 确保余额不为负数
    userWallet.lastUpdated = new Date().toISOString();
    
    // 保存更新后的钱包数据
    localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(walletData));
    
    return userWallet.balances[currency];
}

// 更新用户DZCHY余额（兼容旧版）
function updateUserDZCHYBalance(username, amount) {
    return updateUserBalance(username, 'DZCNY', amount);
}

// 获取用户锁定余额（兼容旧版）
function getUserLockedBalance(username) {
    return 0;
}

// 锁定用户余额（兼容旧版，新钱包不再需要锁定功能）
function lockUserBalance(username, amount) {
    return {
        success: true,
        balance: getUserDZCHYBalance(username),
        lockedBalance: 0
    };
}

// 解锁用户余额（兼容旧版，新钱包不再需要锁定功能）
function unlockUserBalance(username, amount) {
    return {
        success: true,
        balance: getUserDZCHYBalance(username),
        lockedBalance: 0
    };
}

// 记录交易
function recordTransaction(username, transactionData) {
    // 交易记录存储键名
    const TRANSACTIONS_KEY = `dzchy_transactions_${username}`;
    
    // 获取现有交易记录
    let transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    
    // 创建完整的交易记录
    const fullTransaction = {
        id: transactionData.id || `TX${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        type: transactionData.type || 'unknown',
        amount: transactionData.amount || 0,
        timestamp: transactionData.timestamp || new Date().toISOString(),
        status: transactionData.status || 'pending',
        description: transactionData.description || '',
        details: transactionData.details || {}
    };
    
    // 添加新交易记录
    transactions.push(fullTransaction);
    
    // 保存更新后的交易记录
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    
    return fullTransaction;
}

// 获取用户交易记录
function getUserTransactions(username, options = {}) {
    // 交易记录存储键名
    const TRANSACTIONS_KEY = `dzchy_transactions_${username}`;
    
    // 获取现有交易记录
    let transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    
    // 应用筛选和排序选项
    if (options.type) {
        transactions = transactions.filter(t => t.type === options.type);
    }
    
    if (options.status) {
        transactions = transactions.filter(t => t.status === options.status);
    }
    
    // 按时间倒序排序（最新的在前）
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 应用分页
    if (options.limit) {
        transactions = transactions.slice(0, options.limit);
    }
    
    return transactions;
}

// 根据交易ID获取交易记录
function getTransactionById(username, transactionId) {
    const transactions = getUserTransactions(username);
    return transactions.find(t => t.id === transactionId) || null;
}

// 更新交易状态
function updateTransactionStatus(username, transactionId, status, details = {}) {
    // 交易记录存储键名
    const TRANSACTIONS_KEY = `dzchy_transactions_${username}`;
    
    // 获取现有交易记录
    let transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    
    // 查找交易记录
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
        return {
            success: false,
            message: '交易记录不存在'
        };
    }
    
    // 更新交易状态和详情
    transactions[transactionIndex].status = status;
    transactions[transactionIndex].details = { ...transactions[transactionIndex].details, ...details };
    transactions[transactionIndex].updatedAt = new Date().toISOString();
    
    // 保存更新后的交易记录
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    
    return {
        success: true,
        transaction: transactions[transactionIndex]
    };
}

// 获取交易统计信息
function getTransactionStats(username) {
    const transactions = getUserTransactions(username);
    
    // 计算统计数据
    const stats = {
        totalTransactions: transactions.length,
        totalBuyAmount: 0,
        totalRechargeAmount: 0,
        totalWithdrawAmount: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0
    };
    
    // 遍历所有交易记录计算统计数据
    transactions.forEach(transaction => {
        // 根据交易类型累加金额
        switch (transaction.type) {
            case 'buy':
                stats.totalBuyAmount += parseFloat(transaction.amount);
                break;
            case 'recharge':
                stats.totalRechargeAmount += parseFloat(transaction.amount);
                break;
            case 'withdraw':
                stats.totalWithdrawAmount += parseFloat(transaction.amount);
                break;
        }
        
        // 根据交易状态计数
        switch (transaction.status) {
            case 'completed':
                stats.completedTransactions++;
                break;
            case 'pending':
                stats.pendingTransactions++;
                break;
            case 'failed':
                stats.failedTransactions++;
                break;
        }
    });
    
    // 格式化金额
    stats.totalBuyAmount = parseFloat(stats.totalBuyAmount.toFixed(2));
    stats.totalRechargeAmount = parseFloat(stats.totalRechargeAmount.toFixed(2));
    stats.totalWithdrawAmount = parseFloat(stats.totalWithdrawAmount.toFixed(2));
    
    return stats;
}

// 删除交易记录
function deleteTransaction(username, transactionId) {
    // 交易记录存储键名
    const TRANSACTIONS_KEY = `dzchy_transactions_${username}`;
    
    // 获取现有交易记录
    let transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    
    // 查找交易记录索引
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
        return {
            success: false,
            message: '交易记录不存在'
        };
    }
    
    // 删除交易记录
    transactions.splice(transactionIndex, 1);
    
    // 保存更新后的交易记录
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    
    return {
        success: true,
        message: '交易记录已删除'
    };
}

// 清空用户交易记录
function clearUserTransactions(username) {
    // 交易记录存储键名
    const TRANSACTIONS_KEY = `dzchy_transactions_${username}`;
    
    // 清空交易记录
    localStorage.removeItem(TRANSACTIONS_KEY);
    
    return {
        success: true,
        message: '交易记录已清空'
    };
}

// 重置所有钱包数据（用于测试）
function resetWalletData() {
    localStorage.removeItem(WALLET_DATA_KEY);
    
    // 清空所有用户的交易记录
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
        if (key.startsWith('dzchy_transactions_')) {
            localStorage.removeItem(key);
        }
    });
    
    return { success: true, message: '钱包数据已重置' };
}

// 兑换稳定币
function exchangeStablecoin(username, fromCurrency, toCurrency, amount) {
    // 检查汇率是否存在
    if (!EXCHANGE_RATES[fromCurrency] || !EXCHANGE_RATES[fromCurrency][toCurrency]) {
        return {
            success: false,
            message: `不支持从 ${fromCurrency} 到 ${toCurrency} 的兑换`
        };
    }
    
    // 获取用户钱包
    const userWallet = getUserWallet(username);
    
    // 检查余额是否足够
    if (userWallet.balances[fromCurrency] < amount) {
        return {
            success: false,
            message: `您的 ${fromCurrency} 余额不足`
        };
    }
    
    // 计算兑换后的金额
    const rate = EXCHANGE_RATES[fromCurrency][toCurrency];
    const exchangedAmount = (amount * rate).toFixed(6);
    
    // 更新余额
    updateUserBalance(username, fromCurrency, -amount);
    updateUserBalance(username, toCurrency, parseFloat(exchangedAmount));
    
    // 记录交易
    recordTransaction(username, {
        type: 'exchange',
        amount: amount,
        description: `${fromCurrency} 兑换 ${toCurrency}`,
        status: 'completed',
        details: {
            fromCurrency: fromCurrency,
            toCurrency: toCurrency,
            exchangeRate: rate,
            exchangedAmount: exchangedAmount
        }
    });
    
    return {
        success: true,
        message: `成功将 ${amount} ${fromCurrency} 兑换为 ${exchangedAmount} ${toCurrency}`,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        fromAmount: amount,
        toAmount: exchangedAmount
    };
}

// 获取汇率信息
function getExchangeRate(fromCurrency, toCurrency) {
    if (EXCHANGE_RATES[fromCurrency] && EXCHANGE_RATES[fromCurrency][toCurrency]) {
        return EXCHANGE_RATES[fromCurrency][toCurrency];
    }
    return null;
}

// 导出函数
export {
    initWalletData,
    getUserWallet,
    getUserDZCHYBalance,
    getUserUSDTBalance,
    getUserUSDCBalance,
    getUserLockedBalance,
    updateUserDZCHYBalance,
    updateUserBalance,
    lockUserBalance,
    unlockUserBalance,
    recordTransaction,
    getUserTransactions,
    getTransactionById,
    updateTransactionStatus,
    getTransactionStats,
    deleteTransaction,
    clearUserTransactions,
    resetUserWallet,
    resetWalletData,
    exchangeStablecoin,
    getExchangeRate
};

// 添加示例钱包数据（用于演示）
function addSampleWalletData() {
    // 为示例用户添加一些初始余额和交易记录
    const sampleUsers = ['demo', 'user1'];
    
    sampleUsers.forEach(username => {
        // 初始化钱包
        getUserWallet(username);
        
        // 添加一些初始余额（如果没有）
        const currentBalance = getUserDZCHYBalance(username);
        if (currentBalance === 0) {
            updateUserDZCHYBalance(username, 1000); // 初始1000个DZCHY
        }
        
        // 添加一些示例交易记录（如果没有）
        const transactions = getUserTransactions(username);
        if (transactions.length === 0) {
            // 添加一些历史交易记录
            recordTransaction(username, {
                type: 'buy',
                amount: 500,
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天前
                status: 'completed',
                description: '购买DZCHY代币'
            });
            
            recordTransaction(username, {
                type: 'buy',
                amount: 300,
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天前
                status: 'completed',
                description: '购买DZCHY代币'
            });
            
            recordTransaction(username, {
                type: 'withdraw',
                amount: 200,
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1天前
                status: 'completed',
                description: '提现DZCHY代币'
            });
        }
    });
}

// 初始化时添加示例钱包数据（如果需要）
// addSampleWalletData();

// 导出函数
export {
    initWalletData,
    getUserWallet,
    getUserDZCHYBalance,
    getUserUSDTBalance,
    getUserUSDCBalance,
    updateUserBalance,
    updateUserDZCHYBalance,
    recordTransaction,
    getUserTransactions,
    getTransactionStats
};