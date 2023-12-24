/**
 * API for user authentication
 * */
export const loginByUsername = async (user) => {
    const response = await fetch('http://localhost:8080/api/users?authMethod=username', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ username: user.username, password: user.password })
    });
    return response.json();
};

export const loginByEmail = async (user) => {
    const response = await fetch('http://localhost:8080/api/users?authMethod=email', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ email: user.email, password: user.password })
    });
    return response.json();
};

export const signup = async (user) => {
    const response = await fetch('http://localhost:8080/api/users?action=register', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ username: user.username, email:user.email, password: user.password })
    });
    return response.json();
};

/**
 * User Profile API
 * */
export const getUser = async (username) => {
    const response = await fetch(`http://localhost:8080/api/users/${username}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'get',
    });
    if (!response.ok) {
        throw new Error("User get failed");
    }
    return response.json();
}

export const updateUser = async (username,updateObject) => {
    const response = await fetch(`http://localhost:8080/api/user/update/${username}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': window.localStorage.getItem('token')
        },
        method: 'put',
        body: JSON.stringify(updateObject)
    });
    if (!response.ok) {
        if(updateObject.password){
            throw new Error("User Password update failed");
        }else if(updateObject.avatar){
            throw new Error("User Avatar update failed");
        }else{
            throw new Error("User Profile update failed");
        }
    }
    return response.json();
}

export const deleteUser = async (username) => {
    const response = await fetch(`http://localhost:8080/api/user/delete/${username}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': window.localStorage.getItem('token')
        },
        method: 'delete',
    });
    if (!response.ok) {
        throw new Error("Fail to delete user");
    }
    return response.json();
}