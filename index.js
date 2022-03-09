
// 表單驗證宣吿（解構）
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

// 因目前只用到四個所以沒有全部載入
defineRule("required", required);
defineRule("email", email);
defineRule("min", min);
defineRule("max", max);

// 中文版驗證提示-載入
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

// 中文版驗證提示-設定
configure({
	generateMessage: localize("zh_TW"), //啟用 locale
	validateOnInput: true, // 輸入立即進行驗證
});



const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'zoechen';

const app = Vue.createApp({
	data() {
		return {
			cartData: {},
			products: [],
			productId: '',
			isLoadingItem: '',
			form: {
				user: {
					name: '',
					email: '',
					tel: '',
					address: '',
				},
				message: '',
			},
		};
	},
	methods: {
		getProducts() {
			axios.get(`${apiUrl}/api/${apiPath}/products/all`)
				.then((res) => {
					console.log(res);
					this.products = res.data.products;
				})
		},
		getProduct(id) {
			axios.get(`${apiUrl}/api/${apiPath}/product/${id}`)
				.then((res) => {
					this.product = res.data.product;
					this.$refs.productModal.openModal(); //
				})
		},
		openProductModal(id) {
			this.productId = id;
			this.$refs.productModal.openModal();
		},
		getCart() {
			axios.get(`${apiUrl}/api/${apiPath}/cart`)
				.then((res) => {
					console.log('getCart列表：', res);
					this.cartData = res.data.data;
				})
		},
		addToCart(id, qty = 1) {
			const data = {
				product_id: id,
				qty,
			};
			this.isLoadingItem = id;
			axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
				.then((res) => {
					this.getCart();
					this.$refs.productModal.closeModal();
					this.isLoadingItem = '';
				})
		},
		removeCartItem(id) {
			this.isLoadingItem = id;
			axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
				.then((res) => {
					this.getCart();
					this.isLoadingItem = '';
				})
		},
		removeAllCartItems() {
			axios.delete(`${apiUrl}/api/${apiPath}/carts`)
				.then((res) => {
					this.getCart();
				})
		},
		updateCartItem(item) {
			const data = {
				product_id: item.id,
				qty: item.qty,
			};
			this.isLoadingItem = item.id;
			axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
				.then((res) => {
					this.getCart();
					this.isLoadingItem = '';
				})
		},
		orderSubmit() {
			axios.post(`${apiUrl}/api/${apiPath}/order`, { data: this.form })
				.then((res) => {
					alert(res.data.message);
					this.$refs.form.resetForm();
					this.getCart();
				})
				.catch((error) => {
					alert(error.data.message);
				})
		  },
	  },
		mounted() {
			this.getProducts();
			this.getCart();
		},
});

// $refs
app.component('product-modal', {
	props: ['id'],
	template: '#userProductModal',
	data() {
		return {
			modal: {},
			product: {},
			qty: 1,
		};
	},
	watch: {
		id() {
			this.getProduct();
		},
	},
	methods: {
		openModal() {
			this.modal.show();
		},
		closeModal() {
			this.modal.hide();
		},
		getProduct() {
			axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
				.then((res) => {
					this.product = res.data.product;
				})
		},
		addToCart() {
			this.$emit('add-cart', this.product.id, this.qty)
		},
	},
	mounted() {
		this.modal = new bootstrap.Modal(this.$refs.modal);
	},
});

// 全域註冊-驗證
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');