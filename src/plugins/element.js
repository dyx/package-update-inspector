import Vue from 'vue'
import
{
  Button, Input, Message, Table, TableColumn,
  Tag, Form, FormItem, Dialog, Tabs, TabPane,
  Loading, Popover, Popconfirm, Link, Badge,
  Progress, MessageBox, TimeSelect, Switch,
  Alert, CheckboxGroup, Checkbox, Row, Col
} from 'element-ui'

Vue.prototype.$message = Message
Vue.prototype.$msgbox = MessageBox

Vue.use(Button)
Vue.use(Input)
Vue.component(Message.name, Message)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tag)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Dialog)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Loading)
Vue.use(Popover)
Vue.use(Popconfirm)
Vue.use(Link)
Vue.use(Badge)
Vue.use(Progress)
Vue.component(MessageBox.name, MessageBox)
Vue.use(TimeSelect)
Vue.use(Switch)
Vue.use(Alert)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Row)
Vue.use(Col)
