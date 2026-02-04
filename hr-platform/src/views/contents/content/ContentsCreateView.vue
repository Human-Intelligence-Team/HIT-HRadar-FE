<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import TagSideModalView from '@/views/contents/content/TagSideModalView.vue'
const route = useRoute()
const router = useRouter()
const isTagModalOpen = ref(false);
const goListPage = () => {
  router.push('/all/contents')
}

const contentUpdate = () => {
  alert("수정하시겠습니까?")
}

const contentCreate = () => {
  alert("저장하시겠습니까?")
}


const isModalOpen = () => {
  isTagModalOpen.value = !isTagModalOpen.value;
}
</script>

<template>

  <div class="sub" v-if="route.path.split('/')[2] === 'update'">학습컨텐츠 수정</div>
  <div class="sub" v-else>학습컨텐츠 등록</div>
  <div class="card">
    <div class="section">
      <div class="card-bd">
        <table class="table">
          <tr>
            <th>콘텐츠 명<span class="color-red">*</span></th>
            <td colspan="2"><input class="input-tbl" type="text" /></td>
            <td></td>
          </tr>
          <tr>
            <th>유형<span class="color-red">*</span></th>
            <td>
              <select class="select-tbl">
                <option value="">전체</option>
              </select>
            </td>
            <th>난이도<span class="color-red">*</span></th>
            <td>
              <select class="select-tbl">
                <option value="">전체</option>
              </select>
            </td>
          </tr>
          <tr>
            <th>학습시간</th>
            <td>
              <input class="input-tbl" type="text" />
            </td>
            <th>사용여부<span class="color-red">*</span></th>
            <td>
              <select class="select-tbl">
                <option value="">전체</option>
              </select>
            </td>
          </tr>
          <tr>
            <th rowspan="2" class="tag-th">
              <div>
                태그<span class="color-red">*</span>
              </div>
              <div>
                <button class="btn-small " @click="isModalOpen()"> 태그 추가 </button>
              </div>

            </th>
            <td colspan="2" rowspan="2">
              <input class="input-tbl" type="text" />
              <div colspan="3" class="tag-box">
                <div class="tag">#영업</div>
                <div class="tag">#신입</div>
              </div>
            </td>
            <td></td>
          </tr>
          <tr></tr>
        </table>

        <div class="card-btn">
          <button class="btn" @click="goListPage()" v-if="route.path.split('/')[2] === 'update'">취소</button>
          <button class="btn" @click="goListPage()"  v-else>목록</button>
          <button class="btn primary" @click="contentUpdate" v-if="route.path.split('/')[2] === 'update'">수정</button>
          <button class="btn primary" @click="contentCreate" v-else>저장</button>
        </div>
      </div>
      <TagSideModalView
        v-if="isTagModalOpen"
        @close="isModalOpen"
      />
    </div>



  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
@import '@/views/contents/style/tableCss.css';
@import '@/views/contents/style/sideBox.css';

</style>
