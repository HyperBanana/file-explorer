<script setup lang="ts">
import { FileTreeItem } from '../types';
import { useFileTree } from '../composables/useFileTree';

const props = defineProps<{
    modelValue: boolean;
    newItemName: string;
    selectedDirectory: FileTreeItem | null;
    // isAddingFolder: boolean;
    directories: FileTreeItem[];
    expandedModalItems: string[];
    activatedItems: string[];
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'update:newItemName', value: string): void;
    (e: 'update:selectedDirectory', value: FileTreeItem | null): void;
    (e: 'addItem'): void;
    (e: 'handleSelection', items: FileTreeItem[]): void;
}>();

const { getFolderIcon } = useFileTree();

const updateModelValue = (value: boolean) => {
    emit('update:modelValue', value);
};

const updateNewItemName = (value: string) => {
    emit('update:newItemName', value);
};
</script>

<template>
    <v-dialog :model-value="modelValue" @update:model-value="updateModelValue">
        <v-card>
            <v-card-title>
                <span class="text-h5"
                    >Add {{ isAddingFolder ? 'Folder' : 'File' }}</span
                >
            </v-card-title>
            <v-card-text>
                <v-text-field
                    :model-value="newItemName"
                    @update:model-value="updateNewItemName"
                    :label="isAddingFolder ? 'Folder Name' : 'File Name'"
                    required
                ></v-text-field>
                <v-select
                    :model-value="selectedDirectory"
                    @update:model-value="
                        $emit('update:selectedDirectory', $event)
                    "
                    :items="directories"
                    item-title="title"
                    item-value="id"
                    label="Select Directory"
                    required
                    return-object
                >
                    <template #selection="{ item }">
                        {{ item.title }}
                    </template>
                    <template #item="">
                        <v-treeview
                            :items="directories"
                            activatable
                            density="compact"
                            item-children="children"
                            return-object
                            open-all
                            @update:activated="$emit('handleSelection', $event)"
                        >
                            <template #prepend="{ item }">
                                <v-icon>
                                    {{ getFolderIcon(item) }}
                                </v-icon>
                            </template>
                        </v-treeview>
                    </template>
                </v-select>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="updateModelValue(false)"
                >
                    Cancel
                </v-btn>
                <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="$emit('addItem')"
                >
                    Add
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
