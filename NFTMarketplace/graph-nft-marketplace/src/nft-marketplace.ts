// 此文件作用是将合约中的事件映射到schema中的实体
// schema中的实体是用来存储数据的，可以理解为数据库中的表
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/NftMarketplace/NftMarketplace";
import { ItemBought, ItemCanceled, ItemListed } from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {}

export function handleItemCanceled(event: ItemCanceledEvent): void {}

export function handleItemListed(event: ItemListedEvent): void {}
