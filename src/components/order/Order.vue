<template>
  <div>
   <!-- 面包屑导航部分 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
     <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
     <el-breadcrumb-item>订单管理</el-breadcrumb-item>
     <el-breadcrumb-item>订单列表</el-breadcrumb-item>
   </el-breadcrumb>
   <!--卡片视图区域 -->
   <el-card>
     <!-- 搜索与添加用户区域 -->
     <el-row :gutter="20">
       <el-col :span="5">
         <el-input placeholder="请输入内容" v-model="queryIfor.query" clearable>
             <el-button slot="append" icon="el-icon-search"></el-button>
         </el-input>
       </el-col>
     </el-row>
     <!-- 订单表格 -->
      <el-table :data="orderList" border stripe style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope='scope'>
            <el-tag type='success' v-if='scope.row.pay_status=="1"'>已付款</el-tag>
            <el-tag type='danger' v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope='scope'>
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" @click='showBox'></el-button>
            <el-button type="success" icon="el-icon-location" @click='showProgressBox'></el-button>
          </template>
        </el-table-column>
       </el-table>
       <!-- 分页区域 -->
       <el-pagination
             @size-change="handleSizeChange"
             @current-change="handleCurrentChange"
             :current-page="queryIfor.pagenum"
             :page-sizes="[5, 10, 15]"
             :page-size="queryIfor.pagesize"
             layout="total, sizes, prev, pager, next, jumper"
             :total="total">
           </el-pagination>
   </el-card>
   <!-- 修改地址的对话框 -->
   <el-dialog
     title="修改地址"
     :visible.sync="addressVisible"
     width="40%" @close='addressClosed'>
     <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
       <el-form-item label="省市区/县" prop="address1">
          <el-cascader
             v-model="addressForm.address1"
             :options="cityData"></el-cascader>
       </el-form-item>
       <el-form-item label="详细地址" prop="address2">
         <el-input v-model="addressForm.aaddress2"></el-input>
       </el-form-item>
     </el-form>
     <span slot="footer" class="dialog-footer">
       <el-button @click="addressVisible = false">取 消</el-button>
       <el-button type="primary" @click="addressVisible = false">确 定</el-button>
     </span>
   </el-dialog>
   <!-- 展示物流进度的对话框 -->
   <el-dialog title="物流进度" :visible.sync="progressVisible" width="40%">
     <!-- 时间线 -->
       <el-timeline>
         <el-timeline-item
           v-for="(activity, index) in progressInfo"
           :key="index"
           :timestamp="activity.time">
           {{activity.context}}
         </el-timeline-item>
       </el-timeline>
   </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      queryIfor: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      orderList: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityData: cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      var { data: res } = await this.$http.get('orders', { params: this.queryIfor })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
      console.log(this.orderList)
    },
    handleSizeChange(newSize) {
      this.queryIfor.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryIfor.pagenum = newPage
      this.getOrderList()
    },
    showBox() {
      this.addressVisible = true
    },
    addressClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox() {
      var { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败！')
      }
      this.progressInfo = res.data
      this.progressVisible = true
      console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="less" scoped="scoped">
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
  .el-pagination {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%
  }
</style>
