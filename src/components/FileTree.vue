<script setup lang="ts">
import { FileTreeItem } from '../types';
import { useFileTree } from '../composables/useFileTree';

const props = defineProps<{
    items: FileTreeItem[];
    expandedItems: string[];
}>();

const emit = defineEmits<{
    (e: 'update:expandedItems', value: string[]): void;
    (e: 'deleteItem', item: FileTreeItem): void;
}>();

const { getFileIcon, getFolderIcon } = useFileTree();

const updateExpanded = (value: string[]) => {
    emit('update:expandedItems', value);
};
</script>

<template>
    <v-treeview
        :open="expandedItems"
        :items="items"
        item-title="title"
        item-children="children"
        item-value="id"
        open-on-click
        density="compact"
        @update:open="updateExpanded"
    >
        <template #prepend="{ item }">
            <v-icon>
                {{
                    item.children
                        ? getFolderIcon(item)
                        : getFileIcon(item.file ?? '')
                }}
            </v-icon>
        </template>
        <template #append="{ item }">
            <v-menu>
                <template #activator="{ props }">
                    <v-btn
                        icon="mdi-dots-vertical"
                        variant="text"
                        v-bind="props"
                        size="small"
                    ></v-btn>
                </template>
                <v-list>
                    <v-list-item @click="$emit('deleteItem', item)">
                        <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
    </v-treeview>
</template>
