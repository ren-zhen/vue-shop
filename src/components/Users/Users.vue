<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加用户区域 -->
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input placeholder="请输入内容" v-model="queryIfor.query" clearable @clear="getusersList">
              <el-button slot="append" icon="el-icon-search" @click="getusersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域-->
      <el-table :data="usersList" stripe border >
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" ></el-table-column>
        <el-table-column prop="email" label="邮箱" ></el-table-column>
        <el-table-column prop="mobile" label="电话" ></el-table-column>
        <el-table-column prop="role_name" label="角色" ></el-table-column>
        <el-table-column label="状态" >
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- switch开关 -->
            <el-switch v-model="scope.row.mg_state" @change="usersStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" >
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" @click='ShowEditDialog(scope.row.id)'></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" @click='removeUserById(scope.row.id)'></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" @click='setRole(scope.row)'></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
       <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryIfor.pagenum"
            :page-sizes="[2, 5, 10, 15]"
            :page-size="queryIfor.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
    </el-card>
    <!-- 添加用户信息对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="40%" @close="editFormClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" >
        <el-form-item label="用户名" >
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="40%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户姓名：{{userInfo.username}}</p>
        <p>当前用户角色：{{userInfo.role_name}}</p>
        <p>分配用户角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
             <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
           </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      var regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机的正则表达式
      var regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的手机号
        return cb()
      }
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      queryIfor: {
        query: '',
        // 当前是第几页
        pagenum: 1,
        // 当前页显示的几条数
        pagesize: 2
      },
      usersList: [],
      total: 4,
      // 控制用户对话框的显示和隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 自定义校验规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户信息对话框的显示和隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改用户表单的校验规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 自定义校验规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示和隐藏
      setRoleDialogVisible: false,
      // 选中分配角色的用户信息
      userInfo: {},
      // 获取的所有角色列表
      roleList: [],
      // 选中的角色ID
      selectRoleId: ''
    }
  },
  created() {
    this.getusersList()
  },
  methods: {
    async getusersList() {
      var { data: res } = await this.$http.get('users', { params: this.queryIfor })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      this.usersList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryIfor.pagesize = newSize
      // 重新加载列表
      this.getusersList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryIfor.pagenum = newPage
      // 重新加载列表
      this.getusersList()
    },
    // 监听 switch开关 状态的改变
    async usersStateChange(newState) {
      // console.log(newState)
      var { data: res } = await this.$http.put(`users/${newState.id}/state/${newState.mg_state}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        newState.mg_state = !newState.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框关闭的事件
    addDialogClosed() {
      // 对话框关闭重置表单内容
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // valid返回false 或 true
        // console.log(valid)
        var { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功')
        // 添加成功关闭对话框
        this.addDialogVisible = false
        // 重新喧嚷用户列表
        this.getusersList()
      })
    },
    // 控制修改用户信息的对话空的显示与隐藏
    async ShowEditDialog(id) {
      // console.log(id)
      var { data: res } = await this.$http.get('users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改表单的重置事件
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息的预验证并发起网络请求
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('用户信息不正确')
        }
        // 发起数据请求
        var { data: res } = await this.$http.put('users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        }
        // 修改成功关闭对话框
        this.editDialogVisible = false
        // 重新喧染用户列表
        this.getusersList()
        this.$message.success('更新用户信息成功')
      })
    },
    // 删除用户信息
    async removeUserById(id) {
      // console.log(id)
      var confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回字符串 confirm
      // 如果用户取消删除，这返回字符串 cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 确认删除用户发送请求
      // console.log(confirmResult)
      var { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      // 重新喧染列表
      this.getusersList()
    },
    // 点击分配角色按钮，显示对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // console.log(userInfo)
      // 获取所有角色列表
      var { data: res } = await this.$http.get('roles')
      this.roleList = res.data
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表加载失败！')
      }
      this.setRoleDialogVisible = true
    },
    // 监听分配角色对话框关闭事件
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = ''
    },
    // 保存用户分配的新角色
    async saveRole() {
      var { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('设置角色失败！')
      }
      this.$message.success('设置角色成功！')
      this.setRoleDialogVisible = false
      this.getusersList()
    }
  }
}
</script>
