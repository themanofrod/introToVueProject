
var eventBus = new Vue()

Vue.component('product', {
	props: {
		premium: {
			type: Boolean,
			required: true
		}
	},
	template: `
		<div class="product">
			<div class="product-image">
				<img :src="image" :alt="altText">
			</div>

			<div class="product-info">

				<h1>{{ title }}</h1>

				<p v-if="inStock">In Stock</p>
				<p v-else> Out of Stock</p>

				<p v-if="isOnSale">{{ sale }}</p>
				
				<detail-tabs :shipping="shipping" :details="details" :description="description"></detail-tabs>

				<h3>Colors:</h3>
				<div class="horizontal-container">
					<div class="color-box"
						v-for="(variant, index) in variants" 
						:key="variant.variantId"
						:style="{ backgroundColor: variant.variantColor }"
						@click="updateProduct(index)">
					</div>
				</div>
				<div class="horizontal-container">
					<button v-on:click="addToCart"
							:disabled="!inStock"
							:class="{ disabledButton: !inStock }">
						Add to cart
					</button>
					<button @click="removeFromCart">
						Remove from cart
					</button>
				</div>
				
			</div>
			<product-tabs class="reviews" :reviews="reviews"></product-tabs>
		</div>
		`,
		data() {
			return {
				product: 'Socks',
				brand: 'Vue Mastery',
				selectedVariant: 0,
				altText: "A pair of socks",
				description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum, dolores!",
				details: ["80% cotten", "20% polyester", "Gender-neutral"],
				variants: [
					{
						variantId: 2234,
						variantColor: "green",
						variantImage: "./vmSocks-green-onWhite.jpg",
						variantQuanity: 10,
						onSale: true
					},
					{
						variantId: 2235,
						variantColor: "blue",
						variantImage: "./vmSocks-blue-onWhite.jpg",
						variantQuanity: 0,
						onSale: false
					}
				],
				reviews: []
		}
	},
	methods: {
		addToCart() {
			this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
		},
		removeFromCart() {
			this.$emit('remove-from-cart',  this.variants[this.selectedVariant].variantId)
		},
		updateProduct(index) {
			this.selectedVariant = index
		}
	},
	computed: {
		title() {
			return this.brand + ' ' + this.product
		},
		image() {
			return this.variants[this.selectedVariant].variantImage
		},
		inStock() {
			return this.variants[this.selectedVariant].variantQuanity
		},
		sale() {
			return this.brand + ' ' + this.product + " on sale!"
		},
		isOnSale() {
			return this.variants[this.selectedVariant].onSale
		},
		shipping() {
			if (this.premium) {
				return "Free"
			} else {
				return 2.99
			}
		}
      },
      mounted() {
	    eventBus.$on('review-submitted', productReview => {
	      this.reviews.push(productReview)
	    })
      }
})

Vue.component('product-details', {
	props: {
		details: {
			type: Array,
			required: true
		}
	},
	template: `
		<ul>
			<li v-for="detail in details">{{ detail }}</li>
		</ul>
	`
})

Vue.component('product-review', {
	template: `
		<form class="review-form" @submit.prevent="onSubmit">
			<p>
				<label for="name">Name:</label>
				<input id="name" v-model="name" placeholder="Lorem ipsum">
			</p>
			<p>
				<label for="review">Review:</label>      
				<textarea placeholder="Enter your review here..." id="review" v-model="review"></textarea>
			</p>
			<p>
				<label for="rating">Rating:</label>
				<select id="rating" v-model.number="rating">
					<option>5</option>
					<option>4</option>
					<option>3</option>
					<option>2</option>
					<option>1</option>
				</select>
			</p>
			<p>
				<label for="recommend">Would you recommend this product: </label>
				<select id="recommend" v-model="recommend">
					<option>Yes</option>
					<option>No</option>
				</select>
			</p>
				<input type="submit" value="Submit">  
			<p v-if="errors.length">
				<b>Please Correct the following error(s):</b>
				<ul class="errors">
					<li v-for="error in errors">{{ error }}</li>
				</ul>
			</p>
		</form>
	`,
	data() {
		return {
			name: null,
			review: null,
			rating: null,
			recommend: null,
			errors: []
		}
	},
	methods: { 
		onSubmit() {
			if(this.name && this.review && this.rating && this.recommend) {
				let productReview = {
					name: this.name,
					review: this.review,
					rating: this.rating,
					recommend: this.recommend
				}
				eventBus.$emit('review-submitted', productReview)
				this.name = null
				this.review = null
				this.rating = null
				this.recommend = null
			} else {
				if(!this.name) this.errors.push("Name required")
				if(!this.review) this.errors.push("Review required")
				if(!this.rating) this.errors.push("Rating required")
				if(!this.recommend) this.errors.push("\"Would you recommend this product\" required")
			}
		}
	}
})

Vue.component('product-tabs', {
	props: {
		reviews: {
			type: Array,
			required: true
		}
	},
	template:`
		<div>
			<div class="tab-container">
				<span class="tab" 
					v-for="(tab, index) in tabs" 
					:key="tab" 
					@click="selectedTab = tab"
					:class="{ activeTab: selectedTab === tab }"
				>{{ tab }}</span>
			</div>
			<div v-show="selectedTab === 'Reviews'">
				<p v-if="!reviews.length">There are no reviews yet.</p>
				<ul>
					<li v-for="review in reviews">
						<p>{{ review.name }}</p>
						<p>Rating: {{ review.rating }}</p>
						<p>{{ review.review }}</p>
						<p>{{ review.recommend }}</p>
					</li>
				</ul>
			</div>
			<div v-show="selectedTab === 'Make a Review'">
				<product-review></product-review>
			</div>
		</div>
	`,
	data() {
		return {
			tabs: ['Reviews', 'Make a Review'],
			selectedTab: 'Reviews'
		}
	}
})

Vue.component('detail-tabs', {
	props: {
		shipping: {
			required: true
		},
		details: {
			type: Array,
			required: true
		},
		description: {
			type: String,
			required: true
		}
	},
	template: `
		<div>
			<div class="tab-container">
				<span class="tab" 
					v-for="(tab, index) in tabs" 
					:key="tab" 
					@click="selectedTab = tab"
					:class="{ activeTab: selectedTab === tab }"
				>{{ tab }}</span>
			</div>
			<div v-show="selectedTab === 'Shipping'">
				<p>Shipping: {{ shipping }} </p>
			</div>
			<div v-show="selectedTab === 'Details'">
				<h2>Details</h2>
				<p>{{ description }}</p>
				<product-details :details="details"></product-details>
			</div>
		</div>
	`,
	data () {
		return {
			tabs: ['Shipping', 'Details'],
			selectedTab: 'Shipping'
		}
	}
})

var app = new Vue({
	el: '#app',
	data: {
		premium: true,
		cart: []
	},
	methods: {
		updateCart(id) {
			this.cart.push(id)
		},
		removeFromCart(id) {
			this.cart.splice( this.cart.indexOf(id), 1)
		}
	}
})










