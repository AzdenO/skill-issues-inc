import Swiper from "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs";
import PhotoSwipeLightbox from "https://unpkg.com/photoswipe@5/dist/photoswipe-lightbox.esm.js";
/**
 * @module RaidLoading
 * @description Module dealing specifically with loading raid guide content from a JSON file, generating
 * a bootstrap carousel and initialising a carousel item with injected content from JSON source
 *
 * The idea is to have an outer swiper to hold raid name and description, a raid guide Iframe, and an "inner" swiper which
 * will slide through a series of infographics linked to the raid
 *
 * @author AzdenO
 * @requires swiper
 * @version 0.1
 */

//Constant defining the gallery root directory
const galleryDir = "assets/images/galleries/";
//const defining path to raids json file
const raidsJSON = "assets/json/raids.json";

//constant array defining class names required by the main swiper element, swiper wrapper, swiper slides and buttons
const mainSwiperClasses = ["swiper"];
const swiperWrapperClasses = ["swiper-wrapper"];
const swiperSlideClasses = ["swiper-slide"];
const swiperImageClasses = ["img-fluid"];
const swiperButtonClasses = {next:"swiper-button-next",prev:"swiper-button-prev", styling:[]};

//array to contain all gallery swipers as theyre created, so they can be easily initialisid
let innerSwipers = []

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Top-level function called on module load to load json, construct swiper and content, inject swiper into page and initialize
 * swiper module
 * @returns void
 */
async function render(){

    //fetch raids content
    const content = await fetchJSON();
    //create references to HTML DOM elements required
    const container = document.getElementById("raids");
    const raidTemplate = document.querySelector("#raidtemplate");

    //generate main swiper
    const mainSwiper = createSwiper(false);
    //start generating slides
    content.raids.forEach(raid => {
        mainSwiper.wrapper.appendChild(createRaidSlide(raid, raidTemplate));
    });
    container.appendChild(mainSwiper.main);

    initSwipers();
    initLightBox();

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Simple function to fetch raid JSON content and return it
 * @returns Object
 */
async function fetchJSON(){
    let raids = await fetch("./assets/json/raids.json").then(response =>{
        if(!response.ok){
            return new Error("Unable to load raids data");
        }else{
            return response.json();
        }
    });
    return raids;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createSwiper(gallery){

    //assign element IDs based on whether this is the main swiper, or a gallery swiper for a raid slide
    let mainID = "swiper-main";
    let mainWrapperID = "main-wrapper";
    let mainSwiperClass = "outer-swiper";

    if(gallery){
        mainID = "swiper-gallery";
        mainWrapperID = "gallery-wrapper";
        mainSwiperClass = "inner-swiper";
    }

    //create main swiper element
    const swiperMain = document.createElement("div");
    swiperMain.classList.add(mainSwiperClass);
    swiperMain.id = mainID;
    //create wrapper element
    const swiperWrapper = document.createElement("div");
    swiperWrapper.classList.add(...swiperWrapperClasses);
    if(gallery){
        swiperWrapper.classList.add("inner-wrapper");
    }
    swiperWrapper.id = mainWrapperID;


    swiperMain.appendChild(swiperWrapper);

    //create next and previous buttons
    if(!gallery){
        const swiperNext = document.createElement("div");
        swiperNext.classList.add(swiperButtonClasses.next, ...swiperButtonClasses.styling);

        const swiperPrev = document.createElement("div");
        swiperPrev.classList.add(swiperButtonClasses.prev, ...swiperButtonClasses.styling);

        swiperMain.appendChild(swiperNext);
        swiperMain.appendChild(swiperPrev);
    }else{
        const swiperPage = document.createElement("div");
        swiperPage.classList.add("swiper-scrollbar");
        swiperMain.appendChild(swiperPage);
    }

    return {
        main: swiperMain,
        wrapper: swiperWrapper,
    }

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createRaidSlide(raid, template){

    //clone template, create reference to inner div and append swiper-slide class
    const slide = template.content.cloneNode(true);
    const inner = slide.querySelector("#content");
    slide.querySelector("#raid-slide").classList.add(...swiperSlideClasses);

    slide.querySelector("#raidname").innerText = raid.name;
    slide.querySelector("#description").innerText = raid.description;
    slide.querySelector("#difficulty").innerText = "Difficulty Rating: "+raid.difficulty;

    slide.querySelector("#guide").src = raid.guide;

    const gallery = createSwiper(true);
    innerSwipers.push(gallery.main);
    raid.galleryFiles.forEach(image => {
        //create gallery swiper slide
        const gallerySlide = document.createElement("div");
        gallerySlide.classList.add("swiper-slide");

        //create image element
        const imageElement = document.createElement("img");
        imageElement.classList.add("gallery-image");
        imageElement.src = galleryDir+raid.gallery+image;

        //create lightbox anchor
        const lightBoxElement = document.createElement("a");
        lightBoxElement.href = imageElement.src;
        lightBoxElement.classList.add("lightbox-custom");
        lightBoxElement.setAttribute("data-pswp-width","1920");
        lightBoxElement.setAttribute("data-pswp-height","1080");
        lightBoxElement.appendChild(imageElement);

        gallerySlide.appendChild(lightBoxElement);
        gallery.wrapper.appendChild(gallerySlide);
    });
    slide.querySelector("#raid-slide").appendChild(gallery.main);
    return slide;

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initSwipers(){
    const mainSwiper = new Swiper(".outer-swiper",{
        direction:"horizontal",
        overflow:"hidden",
        slidesPerView: 1,
        navigation:{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        spaceBetween:0,
    });

    console.log(innerSwipers.length);
    let count = 0
    innerSwipers.forEach(swiper => {
        new Swiper(swiper,{
            autoplay:{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
            },
            nested: true,
            direction:"horizontal",
            slidesPerView: 2,
            spaceBetween:10,
            speed:8000,
            freeMode:true,
            freeModeMomentum: false,
            threshold:15,
            scrollbar:{
                el: ".swiper-scrollbar",
                draggable: true,
            },
            on:{
                touchEnd: function(){
                    this.autoplay.start();
                },
                scrollbarDragEnd: function(){
                    this.autoplay.start();
                }
            }


        })
        count++;
        console.log(count);
    })
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initLightBox(){
    const lightbox = new PhotoSwipeLightbox({
        gallery: ".inner-swiper .swiper-wrapper",
        children: ".swiper-slide a",
        showHideAnimationType: "zoom",
        pswpModule: () => import("https://unpkg.com/photoswipe@5/dist/photoswipe.esm.js"),
    });
    lightbox.init();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", render);