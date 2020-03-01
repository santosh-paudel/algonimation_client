<template>
	<!-- <div>
        <b-navbar type="dark" variant="faded" class="pt-2 pb-1 pl-3">
            <b-navbar-brand href="#">
                <img id="aa-brand" src="@/assets/logo.svg" alt="Kitten" />
                <b-navbar-brand href="#" class="ml-2">Algo Animation</b-navbar-brand>
            </b-navbar-brand>
        </b-navbar>
    </div>-->
	<div>
		<b-navbar toggleable="sm" type="light" variant="light">
			<b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>

			<b-navbar-brand href="/">
				<div>
					<img id="aa-brand" src="@/assets/logo.svg" alt="Kitten" />
					Algo Animation
				</div>
			</b-navbar-brand>

			<!-- <b-collapse id="nav-text-collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-text>Navbar text</b-nav-text>
                </b-navbar-nav>
            </b-collapse>-->
		</b-navbar>
	</div>
</template>
<script>
export default {
	name: "NavBar"
};
</script>
<style scoped>
#aa-brand {
	max-height: 50px;
	width: auto;
}
</style>
