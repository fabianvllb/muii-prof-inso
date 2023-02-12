import org.springframework.data.jpa.repository.JpaRepository;

public interface DataRepository extends JpaRepository<WebData, Long> {
}