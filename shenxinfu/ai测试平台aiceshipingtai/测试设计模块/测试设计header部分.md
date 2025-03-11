```js
<template>
  <div class="table-header">
    <div class="left-bar">
      <span class="table-title">{{ title }}</span>
      <span class="table-subtitle" v-if="isTestDemand">(共{{ this.demandtotal }}条)</span>
      <span class="separator">|</span>
      <IxTooltip :title="isDisabled ? disabledTooltip : ''" style="z-index: 9999">
        <div>
          <IxButton
            v-if="!isCurrentTab || (isCurrentTab && !isDisabled) || isPartDesign"
            mode="primary"
            class="header-button"
            @click="handlePrimaryAction"
            :disabled="isDisabled"
          >
            <img src="./imgs/gray_creatdemand.svg" class="button-icon" v-if="isDisabled" />
            <img src="./imgs/creatdemand.svg" class="button-icon" v-else />
            {{ primaryActionText }}
          </IxButton>
        </div>
      </IxTooltip>
      <IxButton v-if="isCurrentTab && isDisabled && !isPartDesign" class="header-button-stop" @click="handleStopAction">
        <img src="./imgs/stopcreate.svg" class="button-icon-stop" />
        停止生成
      </IxButton>
      <IxModal :visible="confirmVisible" @close="closeModal" type="confirm" :title="confirmTitle">
        <template #footer>
          <IxButton mode="primary" @click="handleConfirmAction">确认</IxButton>
          <IxButton @click="closeModal">取消</IxButton>
        </template>
      </IxModal>
      <IxButton
        v-if="isTestDemand"
        class="header-button"
        :class="{ 'header-disabled': isDisabled }"
        icon="plus"
        @click="openAddDemandModal"
        :disabled="isDisabled"
      >
        新增需求项
      </IxButton>
      <IxTooltip :title="isDisabled ? disabledTooltip : ''" style="z-index: 9999">
        <div class="next-step" :class="{ 'header-disabled': isDisabled }">
          <IxIcon :name="'info-circle'" :color="isDisabled ? '#1C6EFF' : '#458FFF'" class="header-icon" />
          <span class="header-text">{{ infoText }}</span>
          <IxButton mode="link" @click="handleSecondaryAction" :disabled="isDisabled" class="header-link">{{
            secondaryActionText
          }}</IxButton>
        </div>
      </IxTooltip>
    </div>
    <div v-if="isTestDemand" class="search-box">
      <el-input
        v-model="searchValue"
        size="small"
        placeholder="输入名称搜索"
        style="width: 240px; height: 34px"
        @input="handleSearch"
      >
      </el-input>
      <img src="./imgs/search.svg" alt="search" class="search-icon" />
      <el-popover
        popper-class="filter-popover"
        placement="bottom-end"
        width="340"
        v-model="searchvisible"
        @hide="cancelSearch"
      >
      </el-popover>
    </div>
  </div>
</template>


```
