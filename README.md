# json-tree-util
### json数据与树状结构数据的转换等处理工具

#### 安装
`npm install json-tree-util`

#### 引入
`import jtUtil from "json-tree-util"`


#### 组装树结构(json数据 转成 树状结构数据)
   ```
   
    jtUtil.parse(data, options);

    data: json数组，数据里面包含上下级父子关系
    options: 可选配置项
   
    默认 options = {        
       idField: 'id', // 节点唯一值的字段
       parentIdField: 'parentId', // 保存父亲节点唯一值的字段
       topNodeParentId: 0, // 顶级节点的父亲id
       childrenField: 'children', // 组装的子节点存放的字段
       handleNode: (node, children)=>{} // 节点处理方法
    }
   
   
    使用示例：
    
    const testData = [
       {nodeId: 1, name: '节点1', pid: null},
       {nodeId: 2, name: '节点1-1', pid: 1},
       {nodeId: 3, name: '节点1-2', pid: 1},
       {nodeId: 4, name: '节点1-1-1', pid: 2},
       {nodeId: 5, name: '节点1-1-2', pid: 2},
    ];
    
    const handleNode = (node, children) => {
       node['label'] = node.name;
       node['isLeaf'] = children.length === 0;
    }
    
    const returnData = jtUtil.parse(testData, {
       idField: 'nodeId',
       parentIdField: 'pid',
       topNodeParentId: null,
       childrenField: 'childrenList',
       handleNode,
    })
    
    console.log(JSON.stringify(returnData))
    
    输出： 
    
    [{
       "nodeId": 1,
       "name": "节点1",
       "pid": null,
       "label": "节点1",
       "isLeaf": false,
       "childrenList": [{
           "nodeId": 2,
           "name": "节点1-1",
           "pid": 1,
           "label": "节点1-1",
           "isLeaf": false,
           "childrenList": [{
               "nodeId": 4,
               "name": "节点1-1-1",
               "pid": 2,
               "label": "节点1-1-1",
               "isLeaf": true,
               "childrenList": []
           }, {
               "nodeId": 5,
               "name": "节点1-1-2",
               "pid": 2,
               "label": "节点1-1-2",
               "isLeaf": true,
               "childrenList": []
           }]
       }, {
           "nodeId": 3,
           "name": "节点1-2",
           "pid": 1,
           "label": "节点1-2",
           "isLeaf": true,
           "childrenList": []
       }]
    }]
   
   ```

#### 拆解树结构(树状结构数据 转成 json数据)
    ```
    
    jtUtil.jsonify(data, options);
    
    data: 树状结构数据
    options: 可选配置项
    
    默认 options = {        
        parentIdField: 'parentId', // 保存父亲节点唯一值的字段
        topNodeParentId: 0, // 顶级节点的父亲id
        childrenField: 'children', // 组装的子节点存放的字段
        retainChildren: false // 是否保留子节点数据
        handleNode: (node, children)=>{} // 节点处理方法
    }
    
    
    使用示例：
    
    const testData = [{
        id: 1,
        name: "节点1",
        pid: null,
        childrenList: [{
            id: 2,
            name: "节点1-1",
            pid: 1,
            childrenList: [{
                id: 4,
                name: "节点1-1-1",
                pid: 2,
            }, {
                id: 5,
                name: "节点1-1-2",
                pid: 2,
            }],
        }, {
            id: 3,
            name: "节点1-2",
            pid: 1,
        }],
    }];
    
    const handleNode = (node, children) => {
        node['label'] = node.name;
        node['isLeaf'] = children.length === 0;
    }
    
    const returnData = jtUtil.jsonify(testData, {
        parentIdField: 'pid',
        topNodeParentId: null,
        childrenField: 'childrenList',
        retainChildren: false,
        handleNode,
    })
    
    console.log(JSON.stringify(returnData))
    
    输出：
    
    [
        {"id": 4, "name": "节点1-1-1", "pid": 2},
        {"id": 5, "name": "节点1-1-2", "pid": 2},
        {"id": 2, "name": "节点1-1", "pid": 1},
        {"id": 3, "name": "节点1-2", "pid": 1},
        {"id": 1, "name": "节点1", "pid": null}
    ]
    
    ```
    
#### 在json数组中寻找某目标节点的所有父亲节点
    ```
    
    jtUtil.findParentsInJson(id, data, options);
    
    默认 options = {
        idField: 'id',
        parentIdField: 'parentId', // 保存父亲节点唯一值的字段
        topNodeParentId: 0, // 顶级节点的父亲id
        returnType: 'id', // 返回类型 id:返回id数组  json:返回json数组  tree:返回树状结构数据
        remainNode: true, // 是否将该目标节点一起返回
    }
    
    
    使用示例：
    
    const testData = [
        {nodeId: 1, name: '节点1', pid: null},
        {nodeId: 2, name: '节点1-1', pid: 1},
        {nodeId: 3, name: '节点1-2', pid: 1},
        {nodeId: 4, name: '节点1-1-1', pid: 2},
        {nodeId: 5, name: '节点1-1-2', pid: 2},
    ];
    
    const returnData = jtUtil.findParentsInJson(5, testData, {
        idField: 'nodeId',
        parentIdField: 'pid',
        topNodeParentId: null,
        returnType: 'id',
        // returnType: 'json',
        // returnType: 'tree',
    })
    
    console.log(JSON.stringify(returnData))
    
    // returnType为'id' 返回
    [1,2,5]
    
    // returnType为'json' 返回
    [
        {"nodeId":1,"name":"节点1","pid":null},
        {"nodeId":2,"name":"节点1-1","pid":1},
        {"nodeId":5,"name":"节点1-1-2","pid":2}
    ]
    
    // returnType为'tree' 返回
    [{
        "nodeId": 1,
        "name": "节点1",
        "pid": null,
        "children": [{
            "nodeId": 2,
            "name": "节点1-1",
            "pid": 1,
            "children": [{
                "nodeId": 5,
                "name": "节点1-1-2",
                "pid": 2,
                "children": []
            }]
        }]
    }]
    
    ```