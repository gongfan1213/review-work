```js
<script lang="ts" setup>
/**
 * @description: 知识库组件主入口
 */
import { useVisible } from '@/hooks/use_visible';
import Pdf from './imgs/pdf.svg';
import Doc from './imgs/doc.svg';
import Xlxs from './imgs/xlxs.svg';
import MaxFile from './max_file.vue';
import DeleteModal from './delete_modal.vue';
import { clickDownload } from '@/utils/loadfile';
import { getFileExtension } from '../../../user_page/import_file/const';
interface File {
    id: number;
    name: string;
    type: string | undefined;
    date: string;
    size: string;
    progress: number;
    url: string;
}
const contentRef = ref();
const emits = defineEmits(['open', 'close']);
const { visible, setVisible, toggleVisible } = useVisible(false);
const deleteModalRef = ref();
const maxFileModalRef = ref();
const handleClose = () => {
    setVisible(false);
    emits('close');
};
const MAX_FILE_COUNT = 50;
const files = ref<File[]>([
]);
const selectedFiles = ref<number[]>([]);
const searchQuery = ref('');
const filteredFiles = computed(() => {
    const query = searchQuery.value.trim();
    if (!query) {
        return files.value;
    }
    const regex = new RegExp(query, 'i');
    return files.value.filter(file => regex.test(file.name));
});
const handleUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > 20) {
            maxFileModalRef.value?.open();
            return;
        }

        const newFile: File = {
            id: files.value.length + 1,
            name: file.name,
            type: getFileExtension(file.name),
            date: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(/\//g, '-')
                .replace(',', ''),
            size: `${(file.size / 1024).toFixed(2)} KB`,
            progress: 0,
            url: URL.createObjectURL(file)
        };
        files.value.push(newFile);
        updateFileCount();
        simulateUpload(newFile);
    }
};
const simulateUpload = (file: any) => {
    const interval = setInterval(() => {
        if (file.progress < 100) {
            file.progress += 10;
        } else {
            clearInterval(interval);
        }
    }, 200);
};
const handleDelete = () => {
    deleteModalRef.value?.open(selectedFiles.value);
};
const updateFileCount = () => {
    fileCount.value = `${files.value.length}/${MAX_FILE_COUNT}`;
};

const fileCount = ref(`${files.value.length}/${MAX_FILE_COUNT}`);

const handleFileSelect = (fileId: number) => {
    if (selectedFiles.value.includes(fileId)) {
        selectedFiles.value = selectedFiles.value.filter(id => id !== fileId);
    } else {
        selectedFiles.value.push(fileId);
    }
};

const handleDeleteConfirm = () => {
    files.value = files.value.filter(file => !selectedFiles.value.includes(file.id));
    selectedFiles.value = [];
    updateFileCount();
};
const handleDeleteCancel = () => {
    selectedFiles.value = [];
};
const getFileIcon = (fileType: string | undefined) => {
    switch (fileType) {
        case 'docx':
            return Doc;
        case 'xlsx':
            return Xlxs;
        default:
            return Pdf;
    }
};
defineExpose({
    toggleVisible
});
</script>
<template>
    <div v-show="visible" ref="contentRef" placement="bottom" :visible="visible" class="knowledge-container">
        <div class="flex justify-between px-16px py-20px">
            <span class="text-[var(--color-graphite-d40)] text-16px font-bold">
                {{ $i('dsc.gpt.knowledge_base') }}
            </span>
            <img
                src="../../imgs/close.svg"
                class="cursor-pointer"
                @click="handleClose">
        </div>

        <section class="flex flex-column items-center justify-start h-full px-24px mt-16px">
            <div class="upload-info">
                <div class="bg-image">
                    <div class="main-text">
                        <div class="main-title text-[var(--color-graphite-d40)] text-20px font-bold">
                            {{ $i('dsc.gpt.knowledge_base.header_title') }}
                        </div>
                        <div class="separator"></div>
                        <div class="sub-title">
                            {{ $i('dsc.gpt.knowledge_base.header_text') }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="file-list-section">
                <div class="file-list-header text-[var(--color-graphite-d40)] text-16px font-bold">
                    {{ $i('dsc.gpt.knowledge_base.file_list') }}({{ fileCount }})
                </div>
                <div class="file-actions flex justify-between mt-10px">
                    <div class="flex">
                        <input ref="fileInput" type="file" style="display: none;" @change="handleUpload">
                        <IxTooltip :title="$i('dsc.gpt.knowledge_base.support')">
                            <IxButton class="upload-button mr-8px" @click="$refs.fileInput.click()">
                                {{ $i('dsc.gpt.knowledge_base.upload') }}
                            </IxButton>
                        </IxTooltip>
                        <IxButton class="delete-button" :disabled="selectedFiles.length === 0" @click="handleDelete">
                            {{ $i('dsc.gpt.knowledge_base.delete') }}
                        </IxButton>
                    </div>
                    <IxProSearch
                        v-model="searchQuery"
                        :placeholder="$i('dsc.gpt.knowledge_base.search_name')" class="search" style="width: 160px;height:30px;"></IxProSearch>
                </div>
                <div class="file-list" style="overflow-y: auto; max-height: 400px;">
                    <template v-if="filteredFiles.length > 0">
                        <div v-for="file in filteredFiles" :key="file.id" class="file-item mt-10px">
                            <IxCheckbox class="checkbox" :checked="selectedFiles.includes(file.id)" @change="handleFileSelect(file.id)"></IxCheckbox>
                            <img :src="getFileIcon(file.type)" class="file-icon" />
                            <div class="file-info">
                                <div class="file-name-container">
                                    <div class="file-name">
                                        {{ file.name }}
                                    </div>
                                    <img src="./imgs/download.svg" class="download-icon" @click="clickDownload(file.url, file.name)" />
                                </div>
                                <div class="file-details">
                                    {{ file.date }} {{ file.size }}
                                </div>
                            </div>
                            <div v-if="file.progress < 100" class="progress">
                                <IxProgress :percent="file.progress" />
                            </div>
                            <IxSwitch v-else class="switch"></IxSwitch>
                        </div>
                    </template>
                    <template v-else>
                        <IxEmpty />
               </template>
                    <DeleteModal ref="deleteModalRef" @confirm="handleDeleteConfirm" @cancel="handleDeleteCancel" />
                    <MaxFile ref="maxFileModalRef" />
                </div>
```
- 1.添加安全GPT助手的知识库功能，新增知识库图标。.点击知识库之后，展示知识库弹窗，鼠标悬浮在上传按钮，显示文字提示，点击上传按钮，选择文件上传，.当文件超出20Mb的时候跳出提示，点击我知道了关闭弹窗，进度条显示文件上传的进度，100%显示switch图标，默认是禁用，点击开启，.鼠标悬浮在文件的时候，跳出下载的图标，下载后的文件在网址右侧的下载图标，点击网址右边的下载图标，显示对应的下载文件，文件上传只能docx,pdf，xlxs三种格式，最大20Mb，最多只能上传50个，上传后的文件，显示文件名，上传年月日，时间时/分/秒,还有容量，根据文件的格式显示pdf,docx,xlxs图标，根据文件名搜索文件，显示在文件列表当中，勾选选中的文件，删除按钮解除禁用，默认删除按钮是禁用的，.勾选选中的文件，点击删除按钮，跳出对应的弹窗，点击确定后文件删除，并且，文件列表后的数字-1，文件列表当中没有该文件，.勾选选中的文件，点击删除按钮，点击取消，文件列表数字没有变化，选中的按钮取消选中，删除按钮改为禁用，文件依然在文件列表当中
- 1.资产管理界面，新增应用资产管理,加参数：name_is_update: true，2.编辑应用资产管理,保存之前调用查询接口，如果接口返回的数据的 name 和表单 name 相同，name_is_update 设置为 true，如果不同就设置为 false，desc_is_update 永远设置为 false，修改其他字段，name_is_update还是为false，忽略和删除加参数，name_is_update: true,desc_is_update: true，应用画像，保存之前调用查询接口，如果接口返回的数据的 desc 和表单 desc 相同desc_is_update 设置为 true，如果不同就设置为 false，name_is_update 永远设置为 false，应用画像基础信息，保存之前调用查询接口，如果接口返回的数据的 name 和表单 name 相同，name_is_update 设置为 true，如果不同就设置为 false，desc_is_update 永远设置为 false，保存之前调用查询接口，如果接口返回的数据的 desc 和表单 desc 相同，desc_is_update，设置为 true，如果不同就设置为 false，name_is_update 永远设置为 false，，修改描述，需要携带名字加name_is_update(false)，在编辑名称一栏时，如果desc不为空，携带desc(原数据)和desc_is_update(false)
```js
const originalDesc = ref<string | null>(null);
 desc_is_update: apiForm.value.desc !== originalDesc.value,

const val = {
        ...appFrom.value,
        name_is_update: appFrom.value.name !== props.appDetail.name,
        desc_is_update: false
    };
    if (!val.desc) {
        delete val.desc;
        delete val.desc_is_update;
    }
    params = getFormData(val);
        if (appFrom.value.desc) {
            params.desc = appFrom.value.desc;
        }
```

- 2.数据类型管理-数据类型-fix: [2024071800016]【集成测试】数据类型管理中搜索数据类型名称没有生效
```js
 <search v-if="templateId" ref="IxSearchRef" class="w-560px" :template-id="templateId" @on-refresh="handleRefresh" />
   private handleRefresh(data?: []) {
        this.loadData({
            match_filters: data
        });
    }

```
