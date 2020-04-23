/** ========================== 组装树结构 ========================== **/

const parse_getChildren = (data, parentId, options) => {
    let returnData = [];
    data.forEach(node => {
        if (node[options.parentIdField] === parentId) {
            const children = parse_getChildren(data, node[options.idField], options);
            if (options.handleNode) {
                options.handleNode(node, children)
            }
            node[options.childrenField] = children;
            returnData.push(node);
        }
    });
    return returnData;
};

const parse = function (data, options = {}) {
    options = Object.assign({
        idField: 'id',
        parentIdField: 'parentId',
        topNodeParentId: 0,
        childrenField: 'children',
        handleNode: null
    }, options);
    let returnData;
    returnData = parse_getChildren(data, options.topNodeParentId, options) || [];
    return returnData
};

/** ========================== 组装树结构 ========================== **/


/** ========================== 拆解树结构 ========================== **/

let globalData = []

const jsonify_findChildren = (data, parentId, options) => {
    data.forEach(node => {
        node[options.parentIdField] = parentId;
        const children = node[options.childrenField] || []
        if (options.handleNode) {
            options.handleNode(node, children)
        }
        if (Array.isArray(children)) {
            jsonify_findChildren(children, node.id, options);
            if (options.remainChildren !== true) {
                delete node[options.childrenField]
            }
        }
        globalData.push(node)
    })
};

const jsonify = function (data, options = {}) {
    options = Object.assign({
        parentIdField: 'parentId',
        topNodeParentId: 0,
        childrenField: 'children',
        remainChildren: false,
        handleNode: null
    }, options);
    globalData = [];
    jsonify_findChildren(data, options.topNodeParentId, options);
    return globalData
};

/** ========================== 拆解树结构 ========================== **/


/** ========================== 在json数据中查找某个节点的父亲节点 ========================== **/

const findParentsInJson_json = (id, data, options, remainNode) => {
    data.forEach(node => {
        if (id === node[options.idField]) {
            if (remainNode) {
                globalData.unshift(node);
            }
            if (node[options.parentIdField] !== options.topNodeParentId) {
                findParentsInJson_json(node[options.parentIdField], data, options, true)
            }
        }
    })
}

const findParentsInJson_id = (id, data, options, remainNode) => {
    data.forEach(node => {
        if (id === node[options.idField]) {
            if (remainNode) {
                globalData.unshift(node[options.idField]);
            }
            if (node[options.parentIdField] !== options.topNodeParentId) {
                findParentsInJson_id(node[options.parentIdField], data, options, true)
            }
        }
    })
}

const findParentsInJson = function (id, data, options) {
    options = Object.assign({
        idField: 'id',
        parentIdField: 'parentId',
        topNodeParentId: 0,
        returnType: 'id',
        remainNode: true,
    }, options);
    globalData = [];
    switch (options.returnType) {
        case "id":
            findParentsInJson_id(id, data, options, options.remainNode);
            break
        case 'tree':
            findParentsInJson_json(id, data, options, options.remainNode);
            globalData = parse(globalData, options);
            break
        default:
            findParentsInJson_json(id, data, options, options.remainNode);
    }
    return globalData
}

/** ========================== 在json数据中查找某个节点的父亲节点 ========================== **/


/** ========================== 在json数据中查找某个节点的子节点 ========================== **/

const findChildrenInJson_json = (id, data, options) => {
    data.forEach(node => {
        if (id === node[options.parentIdField]) {
            globalData.push(node);
            findChildrenInJson_json(node[options.idField], data, options)
        }
    })
}

const findChildrenInJson_id = (id, data, options) => {
    data.forEach(node => {
        if (id === node[options.parentIdField]) {
            globalData.push(node[options.idField]);
            findChildrenInJson_id(node[options.idField], data, options)
        }
    })
}

const findChildrenInJson = (id, data, options) => {
    options = Object.assign({
        idField: 'id',
        parentIdField: 'parentId',
        childrenField: 'children',
        returnType: 'id',
        remainNode: true,
    }, options);
    globalData = [];
    let node;
    if (options.remainNode) {
        node = data.find(item => item[options.idField] === id);
    }
    switch (options.returnType) {
        case "id":
            findChildrenInJson_id(id, data, options);
            if (node) {
                globalData.unshift(node[options.idField]);
            }
            break
        case 'tree':
            findChildrenInJson_json(id, data, options);
            options['topNodeParentId'] = id;
            globalData = parse(globalData, options);
            if (node) {
                node[options.childrenField] = globalData;
                globalData = node
            }
            break
        default:
            findChildrenInJson_json(id, data, options);
            if (node) {
                globalData.unshift(node);
            }
    }
    return globalData;
}

/** ========================== 在json数据中查找某个节点的子节点 ========================== **/

module.exports = {parse, jsonify, findParentsInJson, findChildrenInJson}