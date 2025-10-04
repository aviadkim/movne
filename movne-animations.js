jQuery(function ($) {
$(window).on("load", function () {
  // Initial hide for all animated elements
  gsap.set([
	'.features_item',
	'.features_item_type2',
	'.top_square',
	'.accord_list_1 li',
	'.accord_list_2 li',
	'.tx',
	'.top_tx',
	'.s_bt_2:not(.p_bt)',
	'.how_item_tx',
	'.quality_tx', 
	//'.panel_right > p'
  ], {
	opacity: 0,
	y: 80,
	visibility: 'hidden'
  });

  // Split character-based headings
  //const selector = '.main_title, .sec_item_title, .foundations_title, .how_title, .how_item_title, .features_title, .panel_right h3, .meet_meet_title, .sec_meet_title';
	const selector = '.main_title, .sec_item_title, .foundations_title, .how_title, .how_item_title, .features_title, .meet_meet_title, .sec_meet_title';
  $(selector).css('visibility', 'hidden');
  
  const splitSelector = selector.split(',').filter(s => !s.includes('.top_tx')).join(',');
  new SplitText(splitSelector, {
	type: 'chars',
	charsClass: 'char',
	tag: 'span'
  });
  
  $(selector).each(function () {
	const $el = $(this);
	const chars = $el.find('.char');
  
	if (chars.length) {
	  gsap.timeline({
		scrollTrigger: {
		  trigger: $el,
		  start: "top 95%",
		  toggleActions: "play none none none"
		}
	  })
	  .set($el, { visibility: 'visible' })
	  .from(chars, {
		opacity: 0,
		y: 40,
		duration: 0.45,
		ease: "back.out(1.7)",
		stagger: { each: 0.03 }
	  });
	}
  });


  // Number counters
  if ($('.statistics_item_title_in').length > 0) {
	gsap.utils.toArray('.statistics_item_title_in').forEach((el) => {
	  gsap.from(el, {
		textContent: "0",
		duration: 1,
		ease: "power1.inOut",
		modifiers: {
		  textContent: value => Math.floor(+value).toLocaleString('en-US')
		},
		scrollTrigger: {
		  trigger: el,
		  start: "bottom bottom",
		  end: "top top",
		  toggleActions: "play none none reverse"
		}
	  });
	});
  }

  // Generic fade-in using .to()
  function separateFadeTo(selector, delayStep = 0.15) {
	gsap.utils.toArray(selector).forEach((el, i) => {
	  gsap.timeline({
		scrollTrigger: {
		  trigger: el,
		  start: "top 95%",
		  toggleActions: "play none none none"
		}
	  })
	  .set(el, { visibility: 'visible' })
	  .to(el, {
		opacity: 1,
		y: 0,
		duration: 0.9,
		ease: "power2.out",
		delay: i * delayStep
	  });
	});
  }

  // Animate all targets
  separateFadeTo('.features_item');
  separateFadeTo('.features_item_type2', 0.2);
  separateFadeTo('.top_square');
  separateFadeTo('.accord_list_1 li');
  separateFadeTo('.how_item_tx', 0);
  separateFadeTo('.quality_tx', 0);
  separateFadeTo('.tx', 0);
  separateFadeTo('.top_tx', 0);
  separateFadeTo('.s_bt_2:not(.p_bt)', 0);
  separateFadeTo( '.panel_right > p', 0);

  // Animate .s_bt_2.top_bt separately
  gsap.timeline({
	scrollTrigger: {
	  trigger: ".s_bt_2.top_bt",
	  start: "top 95%",
	  toggleActions: "play none none none"
	}
  })
  .set(".s_bt_2.top_bt", { visibility: "visible" })
  .to(".s_bt_2.top_bt", {
	opacity: 1,
	y: 0,
	duration: 0.9,
	ease: "power2.out"
  });

  // Reveal .accord_list_2 items on click
  $('.faq .more').on('click', function(){
	$('.faq .more').hide();
	$('.accord_list_2').slideDown(200, function() {
	  separateFadeTo('.accord_list_2 li', 0.1);
	});
  });
});
});