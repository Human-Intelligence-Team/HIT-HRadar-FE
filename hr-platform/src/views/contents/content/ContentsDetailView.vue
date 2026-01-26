<script setup>
import { useRouter } from 'vue-router'

const router = useRouter();
const goListPage = () => {
  router.push('/all/contents');

}

const contentDelete = (contentId) => {
  alert("삭제하시겠습니까??" + contentId);
}

const goUpdatePage = (contentId) => {
  router.push(`/all/contents/update/${contentId}`);
}
</script>

<template>
  <div class="sub">학습컨텐츠 상세</div>

  <div class="card-bd">
    <table class="table">
      <tr>
        <th>콘텐츠 명</th>
        <td></td>
        <th></th>
        <td></td>
      </tr>
      <tr>
        <th>유형</th>
        <td>
        </td>
        <th>난이도</th>
        <td>
        </td>
      </tr>
      <tr>
        <th>학습시간</th>
        <td>
        </td>
        <th>사용여부</th>
        <td>

        </td>
      </tr>
      <tr>
        <th rowspan="2">태그</th>
        <td colspan="2" rowspan="2">
          <div colspan="3" class="tag-box">
            <div class="tag">#영업</div>
            <div class="tag">#신입</div>
          </div>
        </td>
        <td></td>
      </tr>
      <tr>
      </tr>
    </table>

    <div class="card-btn">
      <button class="btn" @click="goListPage()">목록</button>
      <button class="btn" @click="contentDelete(1)">삭제</button>
      <button class="btn primary " @click="goUpdatePage(1)">수정</button>

    </div>
  </div>
</template>

<style scoped>
@import "@/assets/styles/searchBox.css";
@import "@/views/contents/style/tableCss.css";
</style>
