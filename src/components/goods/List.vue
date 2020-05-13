<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加用户区域 -->
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input placeholder="请输入内容" v-model="queryInfor.query" clearable @clear="getGoodsList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表表格 -->
      <el-table :data="goodList" stripe border width='100%'>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width='97' ></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width='70' ></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width='140'>
          <template slot-scope='scop'>
            {{scop.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width='130'>
          <template slot-scope='scope'>
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size='mini'></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size='mini' @click='removeGoods(scope.row.goods_id)'></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
       <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfor.pagenum"
            :page-sizes="[10, 20, 40, 60]"
            :page-size="queryInfor.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total" background>
       </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfor: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总商品的条数
      total: 0,
      // 商品列表
      goodList: [],
      // 控制添加商品对话框的显示和隐藏
      addDialogVisible: false
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      var { data: res } = await this.$http.get('goods', { params: this.queryInfor })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示的条数改变时，触发的事件
    handleSizeChange(newSize) {
      this.queryInfor.pagesize = newSize
      this.getGoodsList()
    },
    // 页数改变时触发的事件
    handleCurrentChange(newPage) {
      this.queryInfor.pagenum = newPage
      this.getGoodsList()
    },
    // 删除商品
    async removeGoods(id) {
      var confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      var { data: res } = await this.$http.delete(`goods/${id}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败！')
      }
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    // 跳转添加页面
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped="scoped">
  .el-pagination {
    margin-top: 15px;
  }
</style>
