# 利用 slither 进行安全审计

1.需要先安装 python(3),(`python3 --version`和`pip3 --version`检查版本)

2.安装 solc-select 以控制审计的 solidity 版本 (`pip3 install solc-select`)

3.选择 solidity 审计版本,比如 0.8.7 (`solc-select use 0.8.7`)

4.安装 slither-analyzer 进行安全审计 (`pip3 install slither-analyzer`) 检查是否安装 (`slither --help`)

5.进行安全审计 (`slither . --solc-remaps '@openzeppelin=node_modules/@openzeppelin @chainlink=node_modules/@chainlink' --exclude naming-convention,external-function,low-level-calls`)

可以在 package.json 中添加快捷指令: `"slither": "slither . --solc-remaps '@openzeppelin=node_modules/@openzeppelin @chainlink=node_modules/@chainlink' --exclude naming-convention,external-function,low-level-calls",`
