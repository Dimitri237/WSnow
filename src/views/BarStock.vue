<template>

<Navbar />
<Sidebar />

<div class="page">

    <div class="header">
        <h2>🍺 Gestion Stock Bar</h2>
    </div>


    <!-- AJOUT STOCK -->

    <div class="card">

        <h3>
            {{ editMode ? "Modifier une boisson" : "Ajouter une boisson" }}
        </h3>


        <div class="form">


            <div class="image-box">

                <img 
                v-if="form.photo"
                :src="form.photo"
                />

                <span v-else>
                    🍺
                </span>


                <input 
                type="file"
                accept="image/*"
                @change="convertImage"
                />

            </div>



            <input
            v-model="form.name"
            placeholder="Nom de la bière"
            />


            <input
            v-model.number="form.priceBottle"
            type="number"
            placeholder="Prix bouteille"
            />


            <input
            v-model.number="form.priceCrate"
            type="number"
            placeholder="Prix casier"
            />


            <input
            v-model.number="form.quantityCrate"
            type="number"
            min="0"
            placeholder="Nombre de casiers"
            />


            <div class="stock-preview">

                📦 Stock :

                <strong>
                    {{ form.quantityCrate || 0 }}
                </strong>
                casiers

                |

                <strong>
                    {{ (form.quantityCrate || 0) * 12 }}
                </strong>
                bouteilles

            </div>


            <button
            class="btn primary"
            @click="saveProduct"
            >

                {{editMode ? "Modifier" : "Ajouter"}}

            </button>


        </div>

    </div>



    <!-- RECHERCHE -->

    <div class="card">

        <input
        v-model="search"
        placeholder="🔎 Rechercher une bière..."
        />

    </div>



    <!-- LISTE -->


    <div class="card">


        <h3>
            🍺 Boissons disponibles
        </h3>


        <div
        class="product"
        v-for="p in paginatedProducts"
        :key="p.id"
        >


            <img
            :src="p.photo"
            />


            <div class="info">

                <strong>
                    {{p.name}}
                </strong>


                <p>
                    🍾 Bouteille :
                    {{formatMoney(p.priceBottle)}}
                </p>


                <p>
                    📦 Casier :
                    {{formatMoney(p.priceCrate)}}
                </p>


                <p>
                    Stock :
                    {{p.quantityCrate}}
                    casiers

                    (
                    {{p.quantityBottle}}
                    bouteilles
                    )

                </p>


            </div>


            <div class="actions">

                <button
                class="edit"
                @click="editProduct(p)"
                >
                ✏️
                </button>


                <button
                class="delete"
                @click="removeProduct(p)"
                >
                🗑
                </button>


            </div>


        </div>



        <!-- PAGINATION -->


        <div class="pagination">


            <button
            @click="page--"
            :disabled="page===1"
            >
            ⬅️
            </button>


            <span>
                Page {{page}} / {{totalPages}}
            </span>


            <button
            @click="page++"
            :disabled="page===totalPages"
            >
            ➡️
            </button>


        </div>



    </div>


</div>

</template>



<script>

import Navbar from "../components/NavbarPage.vue"
import Sidebar from "../components/SidebarPage.vue"

import {
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc
}
from "firebase/firestore"

import {db} from "../firebase"



export default {


components:{
Navbar,
Sidebar
},


data(){

return{


products:[],


search:"",


page:1,

pageSize:6,


editMode:false,


editId:null,


form:{


name:"",

photo:"",

priceBottle:0,

priceCrate:0,

quantityCrate:0


}


}


},



computed:{


filteredProducts(){


return this.products.filter(p=>

p.name
.toLowerCase()
.includes(
this.search.toLowerCase()
)

)


},



totalPages(){

return Math.ceil(
this.filteredProducts.length /
this.pageSize
)||1

},



paginatedProducts(){


let start=(this.page-1)
*this.pageSize


return this.filteredProducts
.slice(
start,
start+this.pageSize
)


}



},




methods:{



async loadProducts(){


const snap =
await getDocs(
collection(db,"barProducts")
)


this.products =
snap.docs.map(d=>({

id:d.id,

...d.data()

}))


},




convertImage(e){


const file=e.target.files[0]


if(!file)return


const reader=new FileReader()


reader.onload=()=>{


this.form.photo =
reader.result


}


reader.readAsDataURL(file)



},





async saveProduct(){


if(!this.form.name)
return alert(
"Nom obligatoire"
)


const data={


name:this.form.name,


photo:this.form.photo,


priceBottle:this.form.priceBottle,


priceCrate:this.form.priceCrate,


quantityCrate:this.form.quantityCrate,


quantityBottle:
this.form.quantityCrate*12,


updatedAt:new Date()


}




if(this.editMode){


await updateDoc(

doc(
db,
"barProducts",
this.editId
),

data

)


}

else{


await addDoc(

collection(
db,
"barProducts"
),

{

...data,

createdAt:new Date()

}

)


}



this.reset()

await this.loadProducts()



},





editProduct(p){


this.editMode=true


this.editId=p.id


this.form={

name:p.name,

photo:p.photo,

priceBottle:p.priceBottle,

priceCrate:p.priceCrate,

quantityCrate:p.quantityCrate

}


window.scrollTo({
top:0,
behavior:"smooth"
})


},





async removeProduct(p){


if(!confirm(
"Supprimer cette boisson ?"
))
return


await deleteDoc(

doc(
db,
"barProducts",
p.id
)

)


await this.loadProducts()


},





reset(){


this.editMode=false


this.editId=null


this.form={

name:"",
photo:"",
priceBottle:0,
priceCrate:0,
quantityCrate:0

}


},




formatMoney(v){

return new Intl.NumberFormat(
"fr-FR"
)
.format(v)
+" FCFA"

}



},



mounted(){

this.loadProducts()

}



}

</script>




<style scoped>


.page{

max-width:1000px;

margin:auto;

padding:20px;

}



.card{

background:white;

padding:18px;

border-radius:14px;

margin-bottom:20px;

box-shadow:
0 5px 15px rgba(0,0,0,.08);

}



.form{

display:flex;

flex-direction:column;

gap:12px;

}



input{

padding:12px;

border-radius:8px;

border:1px solid #ddd;

}



.image-box img{

width:120px;

height:120px;

object-fit:cover;

border-radius:12px;

}



.image-box span{

font-size:70px;

}



.btn{

padding:12px;

border:none;

border-radius:8px;

cursor:pointer;

}



.primary{

background:#16803c;

color:white;

}



.product{

display:flex;

align-items:center;

gap:15px;

padding:12px 0;

border-bottom:1px solid #eee;

}



.product img{

width:80px;

height:80px;

object-fit:cover;

border-radius:10px;

}



.info{

flex:1;

}



.actions button{

border:none;

padding:8px;

margin:3px;

border-radius:6px;

cursor:pointer;

}



.edit{

background:#facc15;

}



.delete{

background:#ef4444;

color:white;

}



.pagination{

display:flex;

justify-content:center;

gap:20px;

margin-top:20px;

}



@media(max-width:700px){


.product{

flex-direction:column;

align-items:flex-start;

}


}



</style>