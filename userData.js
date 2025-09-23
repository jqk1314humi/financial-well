// userData.js - 用户账号信息管理

// 存储用户数据的键名
const USER_DATA_KEY = 'dzchy_user_data';

// 初始化用户数据存储
function initUserData() {
    // 检查localStorage中是否已有用户数据
    if (!localStorage.getItem(USER_DATA_KEY)) {
        // 创建默认的空用户数据对象
        const defaultUsers = {
            users: []
        };
        // 保存到localStorage
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(defaultUsers));
    }
}

// 注册用户
function registerUser(username, email, password) {
    // 初始化用户数据
    initUserData();
    
    // 获取现有的用户数据
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
    
    // 检查用户名是否已存在
    if (userData.users.some(user => user.username === username)) {
        return {
            success: false,
            field: 'username',
            message: '用户名已存在'
        };
    }
    
    // 检查邮箱是否已存在
    if (userData.users.some(user => user.email === email)) {
        return {
            success: false,
            field: 'email',
            message: '邮箱已被注册'
        };
    }
    
    // 生成用户ID
    const userId = 'USER' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // 创建新用户对象
    const newUser = {
        id: userId,
        username: username,
        email: email,
        password: password, // 在实际应用中应加密存储密码
        created: new Date().toISOString(),
        lastLogin: null
    };
    
    // 添加新用户到用户数据
    userData.users.push(newUser);
    
    // 保存更新后的用户数据
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    return {
        success: true,
        user: newUser
    };
}

// 验证用户登录
function loginUser(username, password) {
    // 初始化用户数据
    initUserData();
    
    // 获取现有的用户数据
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
    
    // 查找匹配的用户
    const user = userData.users.find(user => user.username === username);
    
    // 检查用户是否存在
    if (!user) {
        return {
            success: false,
            message: '用户名不存在'
        };
    }
    
    // 检查密码是否匹配
    if (user.password !== password) {
        return {
            success: false,
            message: '密码错误'
        };
    }
    
    // 更新最后登录时间
    user.lastLogin = new Date().toISOString();
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    return {
        success: true,
        user: user
    };
}

// 根据用户名获取用户信息
function getUserByUsername(username) {
    // 初始化用户数据
    initUserData();
    
    // 获取现有的用户数据
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
    
    // 查找匹配的用户
    return userData.users.find(user => user.username === username) || null;
}

// 根据用户ID获取用户信息
function getUserById(userId) {
    // 初始化用户数据
    initUserData();
    
    // 获取现有的用户数据
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
    
    // 查找匹配的用户
    return userData.users.find(user => user.id === userId) || null;
}

// 更新用户信息
function updateUser(username, updatedData) {
    // 初始化用户数据
    initUserData();
    
    // 获取现有的用户数据
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
    
    // 查找匹配的用户
    const userIndex = userData.users.findIndex(user => user.username === username);
    
    // 检查用户是否存在
    if (userIndex === -1) {
        return {
            success: false,
            message: '用户不存在'
        };
    }
    
    // 更新用户信息
    userData.users[userIndex] = { ...userData.users[userIndex], ...updatedData };
    
    // 保存更新后的用户数据
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    return {
        success: true,
        user: userData.users[userIndex]
    };
}

// 更改用户密码
function changeUserPassword(username, currentPassword, newPassword) {
    // 初始化用户数据
    initUserData();
    
    // 验证当前密码
    const loginResult = loginUser(username, currentPassword);
    if (!loginResult.success) {
        return {
            success: false,
            message: '当前密码错误'
        };
    }
    
    // 更新用户密码
    return updateUser(username, { password: newPassword });
}

// 获取所有用户列表（用于管理员功能）
function getAllUsers() {
    // 初始化用户数据
    initUserData();
    
    // 获取现有的用户数据
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
    
    return userData.users || [];
}

// 搜索用户（根据用户名或邮箱）
function searchUsers(query) {
    const allUsers = getAllUsers();
    const searchQuery = query.toLowerCase();
    
    return allUsers.filter(user => 
        user.username.toLowerCase().includes(searchQuery) || 
        user.email.toLowerCase().includes(searchQuery)
    );
}

// 检查用户名是否已存在
function isUsernameExists(username) {
    const user = getUserByUsername(username);
    return user !== null;
}

// 检查邮箱是否已被注册
function isEmailExists(email) {
    // 初始化用户数据
    initUserData();
    
    // 获取现有的用户数据
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
    
    // 查找匹配的用户
    return userData.users.some(user => user.email === email);
}

// 删除用户（用于管理员功能）
function deleteUser(username) {
    // 初始化用户数据
    initUserData();
    
    // 获取现有的用户数据
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
    
    // 查找匹配的用户索引
    const userIndex = userData.users.findIndex(user => user.username === username);
    
    // 检查用户是否存在
    if (userIndex === -1) {
        return {
            success: false,
            message: '用户不存在'
        };
    }
    
    // 删除用户
    userData.users.splice(userIndex, 1);
    
    // 保存更新后的用户数据
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    return {
        success: true,
        message: '用户已删除'
    };
}

// 重置所有用户数据（用于测试）
function resetUserData() {
    localStorage.removeItem(USER_DATA_KEY);
    initUserData();
    return { success: true, message: '用户数据已重置' };
}

// 导出函数，使其可以在其他文件中使用
export {
    initUserData,
    registerUser,
    loginUser,
    getUserByUsername,
    getUserById,
    updateUser,
    changeUserPassword,
    getAllUsers,
    searchUsers,
    isUsernameExists,
    isEmailExists,
    deleteUser,
    resetUserData
};

// 添加示例用户数据（用于演示）
function addSampleUsers() {
    // 检查是否已有示例用户
    if (getUserByUsername('demo') === null) {
        registerUser('demo', 'demo@example.com', 'password123');
    }
    if (getUserByUsername('user1') === null) {
        registerUser('user1', 'user1@example.com', 'user12345');
    }
}

// 初始化时添加示例用户（如果需要）
// addSampleUsers();