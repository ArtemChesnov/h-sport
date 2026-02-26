import {DTO} from "@/shared/services";


// тип блока:
// A: большая слева + 2 малых справа
// B: 2 малых слева + большая справа
type BlockType = "A" | "B";

type Block = {
    type: BlockType;
    items: DTO.ProductListItemDto[];
};

export function buildBlocks(items: DTO.ProductListItemDto[]): Block[] {
    const blocks: Block[] = [];

    for (let i = 0; i < items.length; i += 3) {
        const slice = items.slice(i, i + 3);
        const blockIndex = i / 3;

        const type: BlockType = blockIndex % 2 === 0 ? "A" : "B";
        blocks.push({ type, items: slice });
    }

    return blocks;
}