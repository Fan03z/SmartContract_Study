# 具体实现流程看 graph 项目流程

首先全局安装 graph: `yarn global add @graphprotocol/graph-cli`

初始化一个 graph 项目: `graph init --studio nft-marketplace`

运行: `graph codegen` ,将 schema.graphql 文件上的所有映射内容放入 generated 文件夹

# 如果出现 `command not found: graph` 错误,运行 `export PATH="$(yarn global bin):$PATH"`
